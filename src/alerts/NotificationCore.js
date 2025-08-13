import { NotificationUtils } from './NotificationUtils.js';
import { NotificationUI } from './NotificationUI.js';
import { UserConfig } from '../sdk/userConfig.js';
import { CacheTTLs } from '../utils/cacheConfig.js';

const userConfig = new UserConfig();
// Cache class IDs per user to avoid duplicate network calls across instances
const classIdsCache = new Map(); // key: `${userConfig.userType}:${userConfig.userId}` -> { value: number[], promise?: Promise<number[]> }

export class NotificationCore {
  constructor({ plugin, modelName = 'EduflowproAlert', limit, targetElementId, scope }) {
    this.plugin = plugin;
    this.modelName = modelName;
    this.targetElementId = targetElementId;
    this.limit = limit;
    this.scope = scope || ((Number.isFinite(limit) && limit > 0 && limit <= 10) ? 'nav' : 'body');
    this.alertsModel = plugin.switchTo(modelName);
    this.query = null;
    this.subscriptions = [];
    this.lastSig = null;
  }

  async fetchClassIds() {
    // Only fetch for students/teachers; admins do not constrain by classes
    const userType = String(userConfig.userType || '').toLowerCase();
    if (userType === 'admin') return [];
    const cacheKey = `${userType}:${userConfig.userId}`;
    const cached = classIdsCache.get(cacheKey);
    if (cached?.value) return cached.value;

    // Try persisted cache (speeds up navbar on fresh loads)
    try {
      const lsKey = `awc:classIds:${cacheKey}`;
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          classIdsCache.set(cacheKey, { value: parsed });
          // Fire-and-forget background refresh to keep it fresh
          setTimeout(() => {
            this.fetchClassIdsNetwork(cacheKey).catch(() => {});
          }, 0);
          return parsed;
        }
      }
    } catch (_) {}

    if (cached?.promise) return cached.promise;

    const inFlight = this.fetchClassIdsNetwork(cacheKey, userType);

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

  async fetchClassIdsNetwork(cacheKey, userType) {
    const uid = Number(userConfig.userId);
    let classIds = [];
    if (userType === 'teacher') {
      // Teachers: find classes where instructor_id = user
      const classModel = this.plugin.switchTo('EduflowproClass');
      const q = classModel
        .query()
        .select(['id'])
        .where('instructor_id', uid)
        .limit(1000)
        .offset(0)
        .noDestroy();
      const payload = await q.fetchDirect().toPromise();
      const recs = Array.isArray(payload?.resp) ? payload.resp : [];
      classIds = recs.map(r => r.id).filter(Boolean);
    } else {
      // Students: enrolments -> classes
      const enrolmentModel = this.plugin.switchTo('EduflowproEnrolment');
      const q = enrolmentModel
        .query()
        .select(['id'])
        .where('student_id', uid)
        .include('Class', q1 => q1.select(['id']))
        .limit(1000)
        .offset(0)
        .noDestroy();
      const payload = await q.fetchDirect().toPromise();
      const recs = Array.isArray(payload?.resp) ? payload.resp : [];
      classIds = recs
        .map(r => {
          const c = r.Class;
          if (!c) return [];
          if (Array.isArray(c)) return c.map(x => x?.id).filter(Boolean);
          return [c.id].filter(Boolean);
        })
        .flat()
        .filter(Boolean);
    }
    const uniq = Array.from(new Set(classIds));
    try { localStorage.setItem(`awc:classIds:${cacheKey}`, JSON.stringify(uniq)); } catch (_) {}
    return uniq;
  }

  buildQuery(classIds = []) {
    const q = this.alertsModel
      .query()
      .select([
        'id',
        'alert_type',
        'content',
        'created_at',
        'is_mentioned',
        'is_read',
        'notified_contact_id',
        'origin_url',
        'parent_announcement_id',
        'parent_class_id',
        'parent_comment_id',
        'parent_post_id',
        'parent_submission_id',
        'title',
        'unique_id',
      ])
      .offset(0)
      .noDestroy();
    if (Number.isFinite(this.limit) && this.limit > 0) {
      q.limit(this.limit);
    }
    const uid = userConfig.userId;
    let hasCondition = false;
    if (uid !== undefined && uid !== null) {
      q.where('notified_contact_id', Number(uid));
      hasCondition = true;
    }
    // For non-admin users, always constrain by class IDs. If none, return no records.
    if (String(userConfig.userType || '').toLowerCase() !== 'admin') {
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

    // Apply ordering: latest first (created_at desc)
    try {
      let applied = false;
      if (typeof q.orderBy === 'function') {
        try { q.orderBy('created_at', 'desc'); applied = true; } catch (_) { }
        if (!applied) { try { q.orderBy([{ path: ['created_at'], type: 'desc' }]); applied = true; } catch (_) { } }
      }
      if (!applied && typeof q.sortBy === 'function') { try { q.sortBy('created_at', 'desc'); applied = true; } catch (_) { } }
      if (!applied && typeof q.order === 'function') { try { q.order('created_at', 'desc'); applied = true; } catch (_) { } }
      if (!applied && typeof q.order_by === 'function') { try { q.order_by('created_at', 'desc'); applied = true; } catch (_) { } }
      if (!applied && typeof q.orderByRaw === 'function') { try { q.orderByRaw('created_at desc'); applied = true; } catch (_) { } }
    } catch (_) { /* ignore */ }

    // Expose debug snapshot for later logging
    this.lastQueryDebug = {
      userId: uid,
      classIds: Array.isArray(classIds) ? classIds.slice() : [],
      preferences: { ...(userConfig.preferences || {}) },
      addedAnyBranch,
    };
    return q;
  }

  // Cache Helpers
  // Lightweight stable hash for keys
  hashKey(str) {
    try {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
      return (h >>> 0).toString(36);
    } catch (_) { return String(Math.abs(str.length || 0)); }
  }
  prefsSignature() {
    try {
      const prefs = userConfig?.preferences || {};
      const keys = Object.keys(prefs).sort();
      const sig = keys.map(k => `${k}:${prefs[k]}`).join('|');
      return this.hashKey(sig);
    } catch (_) { return 'p0'; }
  }
  classSignature(classIds = []) {
    try {
      const ids = Array.isArray(classIds) ? classIds.slice().sort((a,b)=>Number(a)-Number(b)) : [];
      return this.hashKey(ids.join(','));
    } catch (_) { return 'c0'; }
  }
  cacheKey(classIds) {
    const uid = userConfig.userId ?? 'anon';
    const type = String(userConfig.userType || 'unknown').toLowerCase();
    const pSig = this.prefsSignature();
    const cSig = this.classSignature(classIds || this.classIds || []);
    return `awc:alerts:v1:${this.scope}:${type}:${uid}:${pSig}:${cSig}`;
  }
  readCache(classIds) {
    try {
      const raw = localStorage.getItem(this.cacheKey(classIds));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const ttlMs = this.scope === 'nav' ? CacheTTLs.alerts.nav() : CacheTTLs.alerts.body();
      if (!parsed.ts || (Date.now() - parsed.ts) > ttlMs) return null;
      if (parsed.uid !== userConfig.userId) return null;
      if (!Array.isArray(parsed.list)) return null;
      return parsed.list;
    } catch (_) { return null; }
  }
  writeCache(list, classIds) {
    try {
      const cap = this.scope === 'nav' ? (this.limit || 5) : 100;
      const trimmed = Array.isArray(list) ? list.slice(0, cap) : [];
      const sig = this.listSignature(trimmed);
      const value = JSON.stringify({ ts: Date.now(), uid: userConfig.userId, sig, list: trimmed });
      localStorage.setItem(this.cacheKey(classIds), value);
    } catch (_) {}
  }
  getCachedClassIdsSync() {
    try {
      const userType = String(userConfig.userType || '').toLowerCase();
      const key = `awc:classIds:${userType}:${userConfig.userId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }
  preRenderFromCache() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return false;
    // Try using known classIds first, otherwise attempt sync read of classIds cache
    const hintClassIds = Array.isArray(this.classIds) ? this.classIds : this.getCachedClassIdsSync();
    const cached = this.readCache(hintClassIds);
    if (!cached) return false;
    try {
      NotificationUI.renderList(cached, el);
      this.lastSig = this.listSignature(cached);
      return true;
    } catch (_) { return false; }
  }
  async start() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;
    if (userConfig.preferences.turnOffAllNotifications === 'Yes') {
      NotificationUI.renderList([], el);
      return Promise.resolve();
    }
    let classIds = [];
    if (String(userConfig.userType || '').toLowerCase() !== 'admin') {
      classIds = await this.fetchClassIds();
    }
    this.classIds = classIds;
    if (String(userConfig.userType || '').toLowerCase() !== 'admin' && (!Array.isArray(classIds) || classIds.length === 0)) {
      NotificationUI.renderList([], el);
      return;
    }
    this.query = this.buildQuery(classIds);
    this.unsubscribeAll();
    const serverObs = this.query.subscribe ? this.query.subscribe() : this.query.localSubscribe();
    let resolved = false;
    let resolveFirst;
    const firstEmission = new Promise(res => { resolveFirst = res; });
    const serverSub = serverObs.pipe(window.toMainInstance(true)).subscribe(
      (payload) => {
        const raw = Array.isArray(payload?.records) ? payload.records : Array.isArray(payload) ? payload : [];
        // Apply client-side slicing only if no server-side limit was set
        const sliced = (!Number.isFinite(this.limit) || this.limit <= 0) ? raw : raw.slice(0, this.limit);
        const recs = sliced.map(NotificationUtils.mapSdkNotificationToUi);
        const newSig = this.listSignature(recs);
        // Persist to cache for faster warm loads
        this.writeCache(recs, this.classIds);
        const debugInfo = userConfig?.debug?.notifications
          ? (() => {
            const counts = raw.reduce((acc, r) => {
              const t = r.alert_type || 'Unknown';
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            }, {});
            return {
              total: raw.length,
              byType: counts,
              sampleIds: raw.slice(0, 10).map(r => r.id),
              lastQueryDebug: this.lastQueryDebug,
            };
          })()
          : undefined;
        if (!this.lastSig || newSig !== this.lastSig) {
          NotificationUI.renderList(recs, el, debugInfo);
          this.lastSig = newSig;
        }
        if (!resolved) { resolved = true; resolveFirst(); }
      },
      console.error
    );
    this.subscriptions = [serverSub];
    return firstEmission;
  }

  unsubscribeAll() {
    this.subscriptions.forEach(sub => sub && sub.unsubscribe && sub.unsubscribe());
    this.subscriptions = [];
  }

  // For manual refresh if needed
  async forceRefresh() {
    // Rebuild and resubscribe (no fetch/get)
    this.unsubscribeAll();
    if (this.query && typeof this.query.destroy === 'function') this.query.destroy();
    await this.start();
  }

  listSignature(list) {
    try {
      const items = Array.isArray(list) ? list : [];
      const norm = items.map(x => [x.ID, x.Is_Read ? 1 : 0, x.Alert_Type, x.Title, x.Date_Added, x.Parent_Class_ID]).join('|');
      return this.hashKey(norm);
    } catch (_) { return 's0'; }
  }
}
