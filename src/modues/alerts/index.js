import { config } from '../../sdk/config.js';
import { VitalStatsSDK } from '../../sdk/init.js';
import { NotificationCore } from './NotificationCore.js';
import { NotificationUI } from './NotificationUI.js';
import { NotificationUtils } from './NotificationUtils.js';

const { slug, apiKey } = config;

(async function main() {
  try {
    // Initialize SDK
    const sdk = new VitalStatsSDK({ slug, apiKey });
    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;

    // Initialize Notification System
    const notificationCore = new NotificationCore({ plugin });
    await notificationCore.initialFetch();
    notificationCore.subscribeToUpdates();

    // Expose for debugging/manual refresh
    window.notificationCore = notificationCore;
    window.NotificationUI = NotificationUI;
    window.NotificationUtils = NotificationUtils;
  } catch (err) {
    console.error(err);
    const bodyList = document.getElementById('body-notifications-list');
    if (bodyList) bodyList.innerHTML = '<div style="color:red;">Failed to load notifications.</div>';
  }
})();
