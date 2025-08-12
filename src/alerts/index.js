import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';
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

    // Navbar modal filters: unread toggle + tabs (All/Announcements)
    const navUnreadToggle = document.getElementById('navbar-unread-toggle');
    const navTabAll = document.getElementById('navbar-tab-all');
    const navTabAnnouncements = document.getElementById('navbar-tab-announcements');
    let navCurrentTab = 'all'; // 'all' | 'announcements'

    const setActiveTabUI = () => {
      if (!navTabAll || !navTabAnnouncements) return;
      const activeClasses = ['text-[#007C8F]', 'font-semibold', 'border-b-2', 'border-[#007C8F]'];
      const inactiveClasses = ['text-[#586A80]'];
      // Reset
      navTabAll.classList.remove(...activeClasses, ...inactiveClasses);
      navTabAnnouncements.classList.remove(...activeClasses, ...inactiveClasses);
      // Apply
      if (navCurrentTab === 'all') {
        navTabAll.classList.add(...activeClasses);
        navTabAnnouncements.classList.add(...inactiveClasses);
      } else {
        navTabAnnouncements.classList.add(...activeClasses);
        navTabAll.classList.add(...inactiveClasses);
      }
    };

    const applyFiltersToNav = () => {
      if (!navEl) return;
      const hideRead = !!navUnreadToggle?.checked;
      const cards = navEl.querySelectorAll('.notification-card');
      cards.forEach(c => {
        const isUnread = c.classList.contains('unread');
        const t = c.dataset.type || '';
        const matchesTab = navCurrentTab === 'all' || (navCurrentTab === 'announcements' && t === 'Announcement');
        const shouldHide = (hideRead && !isUnread) || !matchesTab;
        c.classList.toggle('hidden', !!shouldHide);
      });
    };

    // Enhance toggle switches: move knob + color track without relying on peer variant
    function bindSwitchMotion(input) {
      if (!input) return;
      const track = input.nextElementSibling;
      const knob = track?.querySelector('span');
      const update = () => {
        const checked = !!input.checked;
        if (track) track.style.backgroundColor = checked ? '#007C8F' : '#BFBFBF';
        if (knob) knob.style.transform = checked ? 'translateX(12px)' : 'translateX(0)';
      };
      input.addEventListener('change', update);
      // Initialize current state
      update();
    }

    if (navUnreadToggle && navEl) {
      navUnreadToggle.addEventListener('change', applyFiltersToNav);
      bindSwitchMotion(navUnreadToggle);
    }
    if (navTabAll && navTabAnnouncements && navEl) {
      navTabAll.addEventListener('click', (e) => { e.preventDefault(); navCurrentTab = 'all'; setActiveTabUI(); applyFiltersToNav(); });
      navTabAnnouncements.addEventListener('click', (e) => { e.preventDefault(); navCurrentTab = 'announcements'; setActiveTabUI(); applyFiltersToNav(); });
      setActiveTabUI();
    }

    // Keep filters applied when list re-renders
    if (navEl) {
      const observer = new MutationObserver(() => applyFiltersToNav());
      observer.observe(navEl, { childList: true, subtree: true });
      window.navNotificationFiltersObserver = observer;
    }

    // Body page tabs (All/Announcements) + unread toggle
    const bodyTabAll = document.getElementById('body-tab-all');
    const bodyTabAnnouncements = document.getElementById('body-tab-announcements');
    const bodyUnreadToggle = document.getElementById('body-unread-toggle');
    let bodyCurrentTab = 'all';
    const setActiveTabUIBody = () => {
      if (!bodyTabAll || !bodyTabAnnouncements) return;
      const activeClasses = ['text-[#007C8F]', 'font-semibold', 'border-b-2', 'border-[#007C8F]'];
      const inactiveClasses = ['text-[#586A80]'];
      bodyTabAll.classList.remove(...activeClasses, ...inactiveClasses);
      bodyTabAnnouncements.classList.remove(...activeClasses, ...inactiveClasses);
      if (bodyCurrentTab === 'all') {
        bodyTabAll.classList.add(...activeClasses);
        bodyTabAnnouncements.classList.add(...inactiveClasses);
      } else {
        bodyTabAnnouncements.classList.add(...activeClasses);
        bodyTabAll.classList.add(...inactiveClasses);
      }
    };
    const applyFiltersToBody = () => {
      if (!bodyEl) return;
      const hideRead = !!bodyUnreadToggle?.checked;
      const cards = bodyEl.querySelectorAll('.notification-card');
      cards.forEach(c => {
        const t = c.dataset.type || '';
        const isUnread = c.classList.contains('unread');
        const matchesTab = bodyCurrentTab === 'all' || (bodyCurrentTab === 'announcements' && t === 'Announcement');
        const shouldHide = (hideRead && !isUnread) || !matchesTab;
        c.classList.toggle('hidden', !!shouldHide);
      });
    };
    if (bodyTabAll && bodyTabAnnouncements && bodyEl) {
      bodyTabAll.addEventListener('click', (e) => { e.preventDefault(); bodyCurrentTab = 'all'; setActiveTabUIBody(); applyFiltersToBody(); });
      bodyTabAnnouncements.addEventListener('click', (e) => { e.preventDefault(); bodyCurrentTab = 'announcements'; setActiveTabUIBody(); applyFiltersToBody(); });
      setActiveTabUIBody();
      const observer = new MutationObserver(() => applyFiltersToBody());
      observer.observe(bodyEl, { childList: true, subtree: true });
      window.bodyNotificationFiltersObserver = observer;
    }
    if (bodyUnreadToggle) {
      bodyUnreadToggle.addEventListener('change', applyFiltersToBody);
      bindSwitchMotion(bodyUnreadToggle);
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
