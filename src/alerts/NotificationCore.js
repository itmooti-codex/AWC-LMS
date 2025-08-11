import { NotificationUtils } from './NotificationUtils.js';
import { NotificationUI } from './NotificationUI.js';
import { UserConfig } from '../sdk/userConfig.js';

const userConfig = new UserConfig();

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
    const enrolmentModel = this.plugin.switchTo('EduflowproEnrolment');
    const q = enrolmentModel
      .query()
      .select(['id'])
      .where('student_id', Number(userConfig.userId))
      .andWhere(query => query.where('status', 'Active').orWhere('status', 'New'))
      .include('Class', q => q.select(['id']))
      .limit(1000)
      .offset(0)
      .noDestroy();
    await q.fetch().pipe(window.toMainInstance(true)).toPromise();
    const recs = q.getAllRecordsArray() || [];
    // Extract class IDs from enrolments
    const classIds = recs
      .map(r => (r.Class && Array.isArray(r.Class) ? r.Class.map(c => c.id) : []))
      .flat()
      .filter(Boolean);
    return classIds;
  }

  buildQuery(classIds = []) {
    const q = this.alertsModel.query().limit(this.limit).offset(0).noDestroy();
    const uid = typeof userConfig.loggedinuserid !== 'undefined' ? userConfig.loggedinuserid : undefined;
    if (uid !== undefined && uid !== null) {
      q.where('notified_contact_id', Number(uid));
    }
    // Only filter by classIds if not admin and classIds provided
    if (userConfig.userType !== 'admin' && Array.isArray(classIds) && classIds.length > 0) {
      q.where('parent_class_id', 'in', classIds);
    }
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
    this.query = this.buildQuery(classIds);
    await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    this.renderFromState();
  }

  renderFromState() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;
    const recs = this.query
      .getAllRecordsArray()
      .slice(0, this.limit)
      .map(NotificationUtils.mapSdkNotificationToUi);
    NotificationUI.renderList(recs, el);
  }

  subscribeToUpdates() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;

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
    this.query = this.buildQuery(classIds);
    const el = document.getElementById(this.targetElementId);
    if (userConfig.preferences.turnOffAllNotifications === 'Yes') {
      if (el) NotificationUI.renderList([], el);
      return;
    }
    await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    this.subscribeToUpdates();
    this.renderFromState();
  }
}
