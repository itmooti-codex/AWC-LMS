import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';
import { CourseCore } from './CourseCore.js';
import { UserConfig } from '../sdk/userConfig.js';

(async function main() {
  try {
    const { slug, apiKey } = config;
    const sdk = new VitalStatsSDK({ slug, apiKey });
    // Pre-render nav skeleton for fast paint
    try {
      const navContainer = document.getElementById('navCoursesContainer');
      if (navContainer) {
        const navLoading = document.getElementById('nav-courses-loading');
        navLoading?.classList.add('hidden');
        navContainer.classList.remove('hidden');
        // light skeleton
        (await import('./CourseUI.js')).CourseUI.renderNavSkeleton(navContainer, 3);

        // Try render from cache even before SDK init
        try {
          const { userId, userType } = new UserConfig();
          const type = String(userType || 'unknown').toLowerCase();
          const limit = 10;
          const key = `awc:courses:nav:${type}:${userId}:${limit}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const { CacheTTLs } = await import('../utils/cacheConfig.js');
            const ttlMs = CacheTTLs.courses.nav();
            if (parsed?.ts && (Date.now() - parsed.ts) <= ttlMs && Array.isArray(parsed.list)) {
              (await import('./CourseUI.js')).CourseUI.renderList(parsed.list, navContainer);
              // Seed signature to avoid repaint after network if unchanged
              const hash = (str) => { try { let h = 5381; for (let i=0;i<str.length;i++) h=((h<<5)+h)^str.charCodeAt(i); return (h>>>0).toString(36);} catch(_){ return 's0'; } };
              const listSig = (list) => { try { return hash((list||[]).map(x => [x.id, x.courseUid, x.classUid, x.courseName, x.className, x.startDate]).join('|')); } catch(_){ return 's0'; } };
              window.__awcNavCoursesPreRendered = true;
              window.__awcNavCoursesSig = parsed.sig || listSig(parsed.list);
            }
          }
        } catch (_) { /* ignore */ }
      }
    } catch (_) {}

    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;
    const core = new CourseCore({
      plugin,
      targetElementId: 'navCoursesContainer',
      loadingElementId: 'nav-courses-loading',
      limit: 10,
      scope: 'nav',
      alreadyRendered: Boolean(window.__awcNavCoursesPreRendered),
    });
    if (window.__awcNavCoursesPreRendered) {
      core.lastSig = window.__awcNavCoursesSig || null;
    }
    core.loadAndRender();
  } catch (err) {
    console.error(err);
  }
})();
