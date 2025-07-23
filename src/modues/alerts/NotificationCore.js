import { NotificationUtils } from './NotificationUtils.js';
import { NotificationUI } from './NotificationUI.js';

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
    return this.alertsModel.query().limit(this.limit).offset(0).noDestroy();
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
    const recs = this.query.getAllRecordsArray().map(NotificationUtils.mapSdkNotificationToUi);
    NotificationUI.renderList(recs, el);
  }

  subscribeToUpdates() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;

    // Clean up previous subscriptions if any
    this.unsubscribeAll();

    // Query subscription: use payload directly
    const serverObs = this.query.subscribe ? this.query.subscribe() : this.query.localSubscribe();
    const serverSub = serverObs.pipe(window.toMainInstance(true)).subscribe(
      () => {
        this.renderFromState();
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
