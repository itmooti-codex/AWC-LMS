import { config } from '../../sdk/config.js';
import { VitalStatsSDK } from '../../sdk/init.js';
import { NotificationCore } from './NotificationCore.js';
import { NotificationUI } from './NotificationUI.js';
import { NotificationUtils } from './NotificationUtils.js';

const { slug, apiKey } = config;

window.loggedinuserid ??= 62;

(async function main() {
  try {
    // Initialize SDK
    const sdk = new VitalStatsSDK({ slug, apiKey });
    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;

    const navEl = document.getElementById('navbar-notifications-list');
    if (navEl) {
      const navCore = new NotificationCore({ plugin, limit: 3, targetElementId: 'navbar-notifications-list' });
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

    function handleCardClick(e) {
      const card = e.target.closest('.notification-card');
      if (!card) return;
      const id = card.dataset.id;
      const url = card.dataset.url;
      if (!id) return;
      markAsRead(id).finally(() => {
        card.classList.remove('unread');
      });
      if (url) window.open(url, '_blank');
    }

    async function markAsRead(id) {
      try {
        await plugin
          .mutation()
          .switchTo('EduflowproAlert')
          .update(q => q.where('id', Number(id)).set({ is_read: true }))
          .execute(true)
          .toPromise();
        window.navNotificationCore?.forceRefresh();
        window.bodyNotificationCore?.forceRefresh();
      } catch (err) {
        console.error(err);
      }
    }

    async function markAllAsRead() {
      try {
        await plugin
          .mutation()
          .switchTo('EduflowproAlert')
          .update(q => q.where('is_read', false).set({ is_read: true }))
          .execute(true)
          .toPromise();
        window.navNotificationCore?.forceRefresh();
        window.bodyNotificationCore?.forceRefresh();
      } catch (err) {
        console.error(err);
      }
    }

    navEl?.addEventListener('click', handleCardClick);
    bodyEl?.addEventListener('click', handleCardClick);
    document.getElementById('navbar-mark-all')?.addEventListener('click', (e) => { e.stopPropagation(); markAllAsRead(); });
    document.getElementById('body-mark-all')?.addEventListener('click', markAllAsRead);

    // Expose utils
    window.NotificationUI = NotificationUI;
    window.NotificationUtils = NotificationUtils;
  } catch (err) {
    console.error(err);
    const bodyList = document.getElementById('body-notifications-list');
    if (bodyList) bodyList.innerHTML = '<div style="color:red;">Failed to load notifications.</div>';
  }
})();

