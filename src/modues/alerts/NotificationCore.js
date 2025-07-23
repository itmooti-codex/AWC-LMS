import { NotificationUtils } from './NotificationUtils.js';
import { NotificationUI } from './NotificationUI.js';

export class NotificationCore {
  constructor({ plugin, modelName = 'EduflowproAlert' }) {
    this.plugin = plugin;
    this.modelName = modelName;
    this.alertsModel = plugin.switchTo(modelName);
    this.query = this.alertsModel.query().limit(500).offset(0).noDestroy();
    this.subscriptions = [];
  }

  async initialFetch() {
    await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    this.renderFromState();
  }

  renderFromState() {
    const recs = this.query.getAllRecordsArray().map(NotificationUtils.mapSdkNotificationToUi);
    NotificationUI.renderNotifications(recs);
  }

  subscribeToUpdates() {
    // Clean up previous subscriptions if any
    this.unsubscribeAll();

    // Query subscription: use payload directly
    const serverObs = this.query.subscribe ? this.query.subscribe() : this.query.localSubscribe();
    const serverSub = serverObs.pipe(window.toMainInstance(true)).subscribe(
      (payload) => {
        const recs = (Array.isArray(payload) ? payload : []).map(NotificationUtils.mapSdkNotificationToUi);
        NotificationUI.renderNotifications(recs);
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
    await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    this.renderFromState();
  }
} 