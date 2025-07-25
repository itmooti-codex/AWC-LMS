import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';
import { NotificationCore } from './NotificationCore.js';
import { NotificationUI } from './NotificationUI.js';
import { NotificationUtils } from './NotificationUtils.js';
import { UserConfig } from '../sdk/userConfig.js';
import { initDOMInteractions } from '../domEvents/DomInit.js';
import { onReady } from '../utils/onReady.js';

const { slug, apiKey } = config;



(async function main() {
  try {
    // Initialize SDK
    const sdk = new VitalStatsSDK({ slug, apiKey });
    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;

    const navEl = document.getElementById('navbar-notifications-list');
    const navLoadingEl = document.getElementById('navbar-notifications-loading');
    if (navEl) {
      try {
        navLoadingEl?.classList.remove('hidden');
        navEl.classList.add('hidden');
        const navCore = new NotificationCore({ plugin, limit: 5, targetElementId: 'navbar-notifications-list' });
        await navCore.initialFetch();
        navCore.subscribeToUpdates();
        window.navNotificationCore = navCore;
      } finally {
        navLoadingEl?.classList.add('hidden');
        navEl.classList.remove('hidden');
      }
    }

    const bodyEl = document.getElementById('body-notifications-list');
    const bodyLoadingEl = document.getElementById('body-notifications-loading');
    if (bodyEl) {
      try {
        bodyLoadingEl?.classList.remove('hidden');
        bodyEl.classList.add('hidden');
        const bodyCore = new NotificationCore({ plugin, limit: 5000, targetElementId: 'body-notifications-list' });
        await bodyCore.initialFetch();
        bodyCore.subscribeToUpdates();
        window.bodyNotificationCore = bodyCore;
      } finally {
        bodyLoadingEl?.classList.add('hidden');
        bodyEl.classList.remove('hidden');
      }
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



