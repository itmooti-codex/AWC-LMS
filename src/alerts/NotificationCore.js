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

  buildQuery() {
    const q = this.alertsModel.query().limit(this.limit).offset(0).noDestroy();
    const uid = typeof userConfig.loggedinuserid !== 'undefined' ? userConfig.loggedinuserid : undefined;
    if (uid !== undefined && uid !== null) {
      q.where('notified_contact_id', Number(uid));
    }
    return q;
  }

  async initialFetch() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;
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
    this.query = this.buildQuery();
    await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    this.subscribeToUpdates();
    this.renderFromState();
  }
}
