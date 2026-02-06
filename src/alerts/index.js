import { config } from "../sdk/config.js";
import { VitalStatsSDK } from "../sdk/init.js";
import { NotificationCore } from "./NotificationCore.js";
import { NotificationUI } from "./NotificationUI.js";
import { NotificationUtils } from "./NotificationUtils.js";
import { UserConfig } from "../sdk/userConfig.js";
// Removed CacheTTLs import - caching disabled for alerts

const { slug, apiKey: configApiKey } = config;

(async function main() {
  try {
    // Global debug banner renderer (visible even before data resolves)
    window.__awcRenderAlertsDebug = function renderAlertsDebug(info) {
      try {
        const id = "awc-debug-alerts-banner";
        let el = document.getElementById(id);
        if (!el) {
          el = document.createElement("div");
          el.id = id;
          el.style.position = "fixed";
          el.style.right = "10px";
          el.style.bottom = "10px";
          el.style.zIndex = "99999";
          el.style.maxWidth = "380px";
          el.style.background = "#fff7ed";
          el.style.border = "1px solid #fed7aa";
          el.style.borderRadius = "8px";
          el.style.padding = "10px";
          el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          document.body.appendChild(el);
        }
        const prefs =
          info && info.preferences
            ? info.preferences
            : window.__awcLastPrefs || {};
        const userId = info?.userId ?? (window.userIdForSDK || "");
        const items = Object.keys(prefs || {})
          .map((k) => `${k}=${prefs[k]}`)
          .join(", ");
        el.innerHTML = `<div style="font-weight:600;color:#9a3412;margin-bottom:6px;">Alerts Debug</div>
          <div style="font-size:12px;color:#7c2d12;">User: ${userId}</div>
          <div style="font-size:12px;color:#7c2d12;white-space:normal;word-break:break-word;">Prefs: ${items}</div>`;
      } catch (_) {}
    };
    // Prepare navbar elements
    const navEl = document.getElementById("navbar-notifications-list");
    const navLoadingEl = document.getElementById("navbar-notifications-loading");
    if (navEl) {
      // Always show skeleton initially; caching removed
      navLoadingEl?.classList.add("hidden");
      navEl.classList.remove("hidden");
      NotificationUI.renderSkeleton(navEl, 3, "nav");
    }

    const bodyEl = document.getElementById("body-notifications-list");
    const bodyLoadingEl = document.getElementById("body-notifications-loading");
    if (bodyEl) {
      // Body shows spinner until data; caching removed
      bodyLoadingEl?.classList.remove("hidden");
      bodyEl.classList.add("hidden");
    }

    // Initialize SDK
    const sdk = new VitalStatsSDK({ slug, apiKey: configApiKey });
    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;

    let navReadyPromise = Promise.resolve();
    if (navEl) {
      const navCore = new NotificationCore({
        plugin,
        limit: 50,
        targetElementId: "navbar-notifications-list",
        scope: "nav",
      });
      window.navNotificationCore = navCore;
      try {
        window.AWC ??= {};
        window.AWC.getAlertsDebug = () => ({
          nav: window.navNotificationCore?.lastQueryDebug,
          body: window.bodyNotificationCore?.lastQueryDebug,
        });
      } catch (_) {}
      // Use skeleton in nav instead of spinner (no cache)
      navLoadingEl?.classList.add("hidden");
      navEl.classList.remove("hidden");
      NotificationUI.renderSkeleton(navEl, 3, "nav");
      navReadyPromise = navCore
        .start()
        .then(() => {
          navLoadingEl?.classList.add("hidden");
          navEl.classList.remove("hidden");
        })
        .catch(() => {
          navLoadingEl?.classList.add("hidden");
          navEl.classList.remove("hidden");
        });
      await navReadyPromise;
    }

    // const bodyEl = document.getElementById('body-notifications-list');
    // const bodyLoadingEl = document.getElementById('body-notifications-loading');
    if (bodyEl) {
      const startBody = async () => {
        bodyLoadingEl?.classList.remove("hidden");
        bodyEl.classList.add("hidden");
        const bodyCore = new NotificationCore({
          plugin,
          limit: 5000,
          targetElementId: "body-notifications-list",
          scope: "body",
        });
        window.bodyNotificationCore = bodyCore;
        try {
          window.AWC ??= {};
          window.AWC.getAlertsDebug = () => ({
            nav: window.navNotificationCore?.lastQueryDebug,
            body: window.bodyNotificationCore?.lastQueryDebug,
          });
        } catch (_) {}
        // No cache pre-render; keep spinner until data
        bodyLoadingEl?.classList.remove("hidden");
        bodyEl.classList.add("hidden");
        await bodyCore.start().finally(() => {
          bodyLoadingEl?.classList.add("hidden");
          bodyEl.classList.remove("hidden");
        });
      };
      // Start body after nav first emission + additional delay to reduce contention
      const scheduleBody = () => {
        const start = () => startBody();
        if (window.requestIdleCallback) {
          window.requestIdleCallback(start, { timeout: 2500 });
        } else {
          setTimeout(start, 900);
        }
      };
      navReadyPromise.then(scheduleBody).catch(scheduleBody);
    }

    function setCardReadStyles(card) {
      if (!card) return;
      card.classList.remove("unread");
      const inner = card.querySelector("div.p-2.items-start");
      if (inner) {
        inner.style.background = "";
        inner.classList.add("bg-white");
      }
    }

    function handleCardClick(e) {
      const card = e.target.closest(".notification-card");
      if (!card) return;
      const id = card.dataset.id;
      const url = card.dataset.url;
      if (!id) return;
      markAsRead(id).finally(() => {
        setCardReadStyles(card);
        updateUnreadDot();
      });
      if (url) window.open(url, "_blank");
    }

    async function markAsRead(id) {
      try {
        const run = async (useId) => {
          const mut = plugin.mutation();
          const target = useId
            ? mut.switchToId("ALERT")
            : mut.switchTo("AwcAlert");
          return target
            .update((q) => q.where("id", Number(id)).set({ is_read: true }))
            .execute(true)
            .toPromise();
        };
        try {
          await run(true);
        } catch (_) {
          await run(false);
        }
        // Subscriptions will emit and update both views automatically
      } catch (err) {
        console.error(err);
      }
    }

    async function markAllAsRead() {
      const unreadCards = Array.from(
        document.querySelectorAll(".notification-card.unread")
      );
      const unreadIds = unreadCards
        .map((c) => Number(c.dataset.id))
        .filter((id) => Number.isFinite(id));

      if (!unreadIds.length) return;

      // Use the same pattern as markAsRead for all unread alerts
      const run = async (useId) => {
        // Update all alerts with is_read = false
        for (const id of unreadIds) {
          const mut = plugin.mutation();
          const target = useId
            ? mut.switchToId("ALERT")
            : mut.switchTo("AwcAlert");
          await target
            .update((q) => q.where("id", Number(id)).set({ is_read: true }))
            .execute(true)
            .toPromise();
        }
      };

      try {
        await run(true);
      } catch (_) {
        try {
          await run(false);
        } catch (err) {
          console.error("Mark all as read failed", err);
          return;
        }
      }

      // Optimistically update DOM
      unreadCards.forEach((c) => setCardReadStyles(c));
      updateUnreadDot();
    }

    navEl?.addEventListener("click", handleCardClick);
    bodyEl?.addEventListener("click", handleCardClick);
    document
      .getElementById("navbar-mark-all")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        markAllAsRead();
      });
    document
      .getElementById("body-mark-all")
      ?.addEventListener("click", markAllAsRead);

    // Navbar modal filters: unread toggle + tabs (All/Announcements)
    const navUnreadToggle = document.getElementById("navbar-unread-toggle");
    const navTabAll = document.getElementById("navbar-tab-all");
    const navTabAnnouncements = document.getElementById(
      "navbar-tab-announcements"
    );
    let navCurrentTab = "all"; // 'all' | 'announcements'

    const setActiveTabUI = () => {
      if (!navTabAll || !navTabAnnouncements) return;
      const activeClasses = [
        "text-[#007C8F]",
        "font-semibold",
        "border-b-2",
        "border-[#007C8F]",
      ];
      const inactiveClasses = ["text-[#586A80]"];
      // Reset
      navTabAll.classList.remove(...activeClasses, ...inactiveClasses);
      navTabAnnouncements.classList.remove(
        ...activeClasses,
        ...inactiveClasses
      );
      // Apply
      if (navCurrentTab === "all") {
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
      const cards = navEl.querySelectorAll(".notification-card");
      cards.forEach((c) => {
        const isUnread = c.classList.contains("unread");
        const t = c.dataset.type || "";
        const matchesTab =
          navCurrentTab === "all" ||
          (navCurrentTab === "announcements" &&
            (t === "Announcement" || t === "Announcement  Mention"));
        const shouldHide = (hideRead && !isUnread) || !matchesTab;
        c.classList.toggle("hidden", !!shouldHide);
      });
    };

    // Enhance toggle switches: move knob + color track without relying on peer variant
    function bindSwitchMotion(input) {
      if (!input) return;
      const track = input.nextElementSibling;
      const knob = track?.querySelector("span");
      const update = () => {
        const checked = !!input.checked;
        if (track)
          track.style.backgroundColor = checked ? "#007C8F" : "#BFBFBF";
        if (knob)
          knob.style.transform = checked ? "translateX(12px)" : "translateX(0)";
      };
      input.addEventListener("change", update);
      // Initialize current state
      update();
    }

    if (navUnreadToggle && navEl) {
      navUnreadToggle.addEventListener("change", applyFiltersToNav);
      bindSwitchMotion(navUnreadToggle);
    }
    if (navTabAll && navTabAnnouncements && navEl) {
      navTabAll.addEventListener("click", (e) => {
        e.preventDefault();
        navCurrentTab = "all";
        setActiveTabUI();
        applyFiltersToNav();
      });
      navTabAnnouncements.addEventListener("click", (e) => {
        e.preventDefault();
        navCurrentTab = "announcements";
        setActiveTabUI();
        applyFiltersToNav();
      });
      setActiveTabUI();
    }

    // Keep filters applied when list re-renders
    if (navEl) {
      const observer = new MutationObserver(() => applyFiltersToNav());
      observer.observe(navEl, { childList: true, subtree: true });
      window.navNotificationFiltersObserver = observer;
    }

    // Body page tabs (All/Announcements) + unread toggle
    const bodyTabAll = document.getElementById("body-tab-all");
    const bodyTabAnnouncements = document.getElementById(
      "body-tab-announcements"
    );
    const bodyUnreadToggle = document.getElementById("body-unread-toggle");
    let bodyCurrentTab = "all";
    const setActiveTabUIBody = () => {
      if (!bodyTabAll || !bodyTabAnnouncements) return;
      const activeClasses = [
        "text-[#007C8F]",
        "font-semibold",
        "border-b-2",
        "border-[#007C8F]",
      ];
      const inactiveClasses = ["text-[#586A80]"];
      bodyTabAll.classList.remove(...activeClasses, ...inactiveClasses);
      bodyTabAnnouncements.classList.remove(
        ...activeClasses,
        ...inactiveClasses
      );
      if (bodyCurrentTab === "all") {
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
      const cards = bodyEl.querySelectorAll(".notification-card");
      cards.forEach((c) => {
        const t = c.dataset.type || "";
        const isUnread = c.classList.contains("unread");
        const matchesTab =
          bodyCurrentTab === "all" ||
          (bodyCurrentTab === "announcements" &&
            (t === "Announcement" || t === "Announcement  Mention"));
        const shouldHide = (hideRead && !isUnread) || !matchesTab;
        c.classList.toggle("hidden", !!shouldHide);
      });
    };
    if (bodyTabAll && bodyTabAnnouncements && bodyEl) {
      bodyTabAll.addEventListener("click", (e) => {
        e.preventDefault();
        bodyCurrentTab = "all";
        setActiveTabUIBody();
        applyFiltersToBody();
      });
      bodyTabAnnouncements.addEventListener("click", (e) => {
        e.preventDefault();
        bodyCurrentTab = "announcements";
        setActiveTabUIBody();
        applyFiltersToBody();
      });
      setActiveTabUIBody();
      const observer = new MutationObserver(() => applyFiltersToBody());
      observer.observe(bodyEl, { childList: true, subtree: true });
      window.bodyNotificationFiltersObserver = observer;
    }
    if (bodyUnreadToggle) {
      bodyUnreadToggle.addEventListener("change", applyFiltersToBody);
      bindSwitchMotion(bodyUnreadToggle);
    }

    // Unread red dot on bell icon
    function updateUnreadDot() {
      try {
        const btn = document.getElementById("toggle-notifications");
        if (!btn) return;
        let dot = document.getElementById("navbar-unread-dot");
        if (!dot) {
          dot = document.createElement("span");
          dot.id = "navbar-unread-dot";
          dot.style.position = "absolute";
          dot.style.top = "6px";
          dot.style.right = "6px";
          dot.style.width = "8px";
          dot.style.height = "8px";
          dot.style.borderRadius = "9999px";
          dot.style.background = "#DC2626";
          dot.style.display = "none";
          btn.parentElement?.appendChild(dot);
        }
        const anyUnread = !!document.querySelector(
          "#navbar-notifications-list .notification-card.unread"
        );
        dot.style.display = anyUnread ? "inline-block" : "none";
      } catch (_) {}
    }
    // Update dot when lists change
    const unreadObserver = new MutationObserver(() => updateUnreadDot());
    if (navEl)
      unreadObserver.observe(navEl, { childList: true, subtree: true });
    updateUnreadDot();

    // Expose utils
    window.NotificationUI = NotificationUI;
    window.NotificationUtils = NotificationUtils;
  } catch (err) {
    console.error(err);
    const bodyList = document.getElementById("body-notifications-list");
    if (bodyList)
      bodyList.innerHTML =
        '<div style="color:red;">Failed to load notifications.</div>';
  }
})();
