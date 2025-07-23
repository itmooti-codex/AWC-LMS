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

    const navEl = document.getElementById('navbar-notifications-list');
    if (navEl) {
      const navCore = new NotificationCore({ plugin, limit: 20, targetElementId: 'navbar-notifications-list' });
      await navCore.initialFetch();
      navCore.subscribeToUpdates();
      window.navNotificationCore = navCore;
    }

    const bodyEl = document.getElementById('body-notifications-list');
    if (bodyEl) {
      const bodyCore = new NotificationCore({ plugin, limit: 5000, targetElementId: 'body-notifications-list' });
      await bodyCore.initialFetch();
      bodyCore.subscribeToUpdates();
      window.bodyNotificationCore = bodyCore;
    }

    // Expose utils
    window.NotificationUI = NotificationUI;
    window.NotificationUtils = NotificationUtils;
  } catch (err) {
    console.error(err);
    const bodyList = document.getElementById('body-notifications-list');
    if (bodyList) bodyList.innerHTML = '<div style="color:red;">Failed to load notifications.</div>';
  }
})();

