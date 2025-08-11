import { NotificationUtils } from './NotificationUtils.js';
import { NotificationUI } from './NotificationUI.js';
import { UserConfig } from '../sdk/userConfig.js';

const userConfig = new UserConfig();
// Cache class IDs per user to avoid duplicate network calls across instances
const classIdsCache = new Map(); // key: `${userConfig.userType}:${userConfig.userId}` -> { value: number[], promise?: Promise<number[]> }

export class NotificationCore {
  constructor({ plugin, modelName = 'EduflowproAlert', limit, targetElementId }) {
    this.plugin = plugin;
    this.modelName = modelName;
    this.targetElementId = targetElementId;
    this.limit = limit;
    this.alertsModel = plugin.switchTo(modelName);
    this.query = this.buildQuery();
    this.subscriptions = [];
  }

  async fetchClassIds() {
    // Only fetch for students/teachers
    if (userConfig.userType === 'admin') return [];
    const cacheKey = `${userConfig.userType}:${userConfig.userId}`;
    const cached = classIdsCache.get(cacheKey);
    if (cached?.value) return cached.value;
    if (cached?.promise) return cached.promise;

    const inFlight = (async () => {
      const enrolmentModel = this.plugin.switchTo('EduflowproEnrolment');
      const q = enrolmentModel
        .query()
        .select(['id'])
        .where('student_id', Number(userConfig.userId))
        .include('Class', q => q.select(['id']))
        .limit(1000)
        .offset(0)
        .noDestroy();
      await q.fetch().pipe(window.toMainInstance(true)).toPromise();
      const recs = q.getAllRecordsArray() || [];
      const classIds = recs
        .map(r => {
          const c = r.Class;
          if (!c) return [];
          if (Array.isArray(c)) return c.map(x => x?.id).filter(Boolean);
          return [c.id].filter(Boolean);
        })
        .flat()
        .filter(Boolean);
      // Ensure uniqueness
      return Array.from(new Set(classIds));
    })();

    classIdsCache.set(cacheKey, { promise: inFlight });
    try {
      const value = await inFlight;
      classIdsCache.set(cacheKey, { value });
      return value;
    } catch (e) {
      classIdsCache.delete(cacheKey);
      throw e;
    }
  }

  buildQuery(classIds = []) {
    const q = this.alertsModel.query().limit(this.limit).offset(0).noDestroy();
    const uid = userConfig.userId;
    let hasCondition = false;
    if (uid !== undefined && uid !== null) {
      q.where('notified_contact_id', Number(uid));
      hasCondition = true;
    }
    // For non-admin users, always constrain by class IDs. If none, return no records.
    if (userConfig.userType !== 'admin') {
      const ids = Array.isArray(classIds) ? classIds : [];
      if (ids.length === 0) {
        // No classes → no alerts
        q.limit(0);
      } else {
        const args = ['parent_class_id', 'in', ids];
        if (hasCondition) q.andWhere(...args);
        else q.where(...args);
        hasCondition = true;
      }
    }

    // Apply user preference conditions for alert types, mentions, and ownership checks
    const p = userConfig.preferences || {};
    const yes = (v) => String(v).toLowerCase() === 'yes';

    // Build a grouped OR clause covering all enabled categories
    let addedAnyBranch = false;
    const addGroup = (group) => {
      const addBranch = (fn) => {
        // each branch is (A and B and C) combined via OR with other branches
        if (typeof fn === 'function') {
          group.orWhere(fn);
          addedAnyBranch = true;
        }
      };

      // Base types
      if (yes(p.posts)) addBranch(sub => sub.where('alert_type', 'Post'));
      if (yes(p.submissions)) addBranch(sub => sub.where('alert_type', 'Submission'));
      if (yes(p.announcements)) addBranch(sub => sub.where('alert_type', 'Announcement'));

      // Comment types (all comments regardless of authorship)
      if (yes(p.postComments)) addBranch(sub => sub.where('alert_type', 'Post Comment'));
      if (yes(p.submissionComments)) addBranch(sub => sub.where('alert_type', 'Submission Comment'));
      if (yes(p.announcementComments)) addBranch(sub => sub.where('alert_type', 'Announcement Comment'));

      // Comments on my entities (authorship checks)
      if (yes(p.commentsOnMyPosts)) {
        addBranch(sub =>
          sub
            .where('alert_type', 'Post Comment')
            .andWhere('Parent_Comment', q1 =>
              q1.andWhere('Forum_Post', q2 => q2.where('author_id', Number(uid)))
            )
        );
      }
      if (yes(p.commentsOnMySubmissions)) {
        addBranch(sub =>
          sub
            .where('alert_type', 'Submission Comment')
            .andWhere('Parent_Comment', q1 =>
              q1.andWhere('Submissions', q2 =>
                q2.andWhere('Assessment_Attempt', q3 =>
                  q3.andWhere('Student', q4 => q4.where('student_id', Number(uid)))
                )
              )
            )
        );
      }
      if (yes(p.commentsOnMyAnnouncements)) {
        addBranch(sub =>
          sub
            .where('alert_type', 'Announcement Comment')
            .andWhere('Parent_Comment', q1 =>
              q1.andWhere('Announcements', q2 => q2.where('instructor_id', Number(uid)))
            )
        );
      }

      // Mentions (require is_mentioned = true)
      if (yes(p.postMentions)) addBranch(sub => sub.where('alert_type', 'Post Mention').andWhere('is_mentioned', true));
      if (yes(p.postCommentMentions)) addBranch(sub => sub.where('alert_type', 'Post Comment Mention').andWhere('is_mentioned', true));
      if (yes(p.announcementMentions)) addBranch(sub => sub.where('alert_type', 'Announcement Mention').andWhere('is_mentioned', true));
      if (yes(p.announcementCommentMentions)) addBranch(sub => sub.where('alert_type', 'Announcement Comment Mention').andWhere('is_mentioned', true));
      if (yes(p.submissionMentions)) addBranch(sub => sub.where('alert_type', 'Submission Mention').andWhere('is_mentioned', true));
      if (yes(p.submissionCommentMentions)) addBranch(sub => sub.where('alert_type', 'Submission Comment Mention').andWhere('is_mentioned', true));
    };
    q.andWhere(addGroup);
    if (!addedAnyBranch) {
      // If no preferences are enabled, force no results
      q.limit(0);
    }

    // Expose debug snapshot for later logging
    this.lastQueryDebug = {
      userId: uid,
      classIds: Array.isArray(classIds) ? classIds.slice() : [],
      preferences: { ...(userConfig.preferences || {}) },
      addedAnyBranch,
    };
    return q;
  }

  async initialFetch() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;
    if (userConfig.preferences.turnOffAllNotifications === 'Yes') {
      NotificationUI.renderList([], el); // Show no notifications
      return;
    }
    let classIds = [];
    if (userConfig.userType !== 'admin') {
      classIds = await this.fetchClassIds();
    }
    this.classIds = classIds;
    if (userConfig.userType !== 'admin' && (!Array.isArray(classIds) || classIds.length === 0)) {
      // No classes → do not fetch
      NotificationUI.renderList([], el);
      return;
    }
    this.query = this.buildQuery(classIds);
    await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    this.renderFromState();
  }

  renderFromState() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;
    const all = (this.query && typeof this.query.getAllRecordsArray === 'function')
      ? (this.query.getAllRecordsArray() || [])
      : [];
    // Debug: log summary and breakdown by alert_type
    if (userConfig?.debug?.notifications) {
      try {
        const counts = all.reduce((acc, r) => {
          const t = r.alert_type || 'Unknown';
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {});
        // Lightweight snapshot of first few IDs
        const sampleIds = all.slice(0, 10).map(r => r.id);
        // eslint-disable-next-line no-console
        console.info('[NotificationCore][Debug] Query snapshot:', {
          lastQueryDebug: this.lastQueryDebug,
          total: all.length,
          byType: counts,
          sampleIds,
        });
      } catch (_) {}
    }
    const recs = all
      .slice(0, this.limit)
      .map(NotificationUtils.mapSdkNotificationToUi);
    NotificationUI.renderList(recs, el);
  }

  subscribeToUpdates() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;
    if (userConfig.userType !== 'admin' && (!Array.isArray(this.classIds) || this.classIds.length === 0)) {
      // No classes → nothing to subscribe to
      return;
    }

    // Clean up previous subscriptions if any
    this.unsubscribeAll();

    // Query subscription: use payload directly to avoid dataset conflicts
    const serverObs = this.query.subscribe ? this.query.subscribe() : this.query.localSubscribe();
    const serverSub = serverObs.pipe(window.toMainInstance(true)).subscribe(
      (payload) => {
        const recs = (Array.isArray(payload?.records) ? payload.records : Array.isArray(payload) ? payload : [])
          .map(NotificationUtils.mapSdkNotificationToUi);
        NotificationUI.renderList(recs, el);
      },
      console.error
    );

    // Plugin subscription (optional, for extra safety)
    const pluginSub = this.plugin.subscribe(p => {
      if (p.__changes && p.__changes[this.modelName] === 'updated' && p.__changesEvent === 'commit') {
        this.renderFromState();
      }
    });

    // Model subscription (optional, for extra safety)
    const modelSub = this.alertsModel.subscribe(() => {
      this.renderFromState();
    });

    this.subscriptions = [serverSub, pluginSub, modelSub];
  }

  unsubscribeAll() {
    this.subscriptions.forEach(sub => sub && sub.unsubscribe && sub.unsubscribe());
    this.subscriptions = [];
  }

  // For manual refresh if needed
  async forceRefresh() {
    this.unsubscribeAll();
    if (this.query && typeof this.query.destroy === 'function') {
      this.query.destroy();
    }
    let classIds = [];
    if (userConfig.userType !== 'admin') {
      classIds = await this.fetchClassIds();
    }
    this.classIds = classIds;
    this.query = this.buildQuery(classIds);
    const el = document.getElementById(this.targetElementId);
    if (userConfig.preferences.turnOffAllNotifications === 'Yes') {
      if (el) NotificationUI.renderList([], el);
      return;
    }
    if (userConfig.userType !== 'admin' && (!Array.isArray(classIds) || classIds.length === 0)) {
      if (el) NotificationUI.renderList([], el);
      return;
    }
    await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    this.subscribeToUpdates();
    this.renderFromState();
  }
}
