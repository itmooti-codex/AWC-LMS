import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';
import { CourseCore } from './CourseCore.js';

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
      }
    } catch (_) {}

    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;
    const core = new CourseCore({
      plugin,
      targetElementId: 'navCoursesContainer',
      loadingElementId: 'nav-courses-loading',
      limit: 10,
    });
    core.loadAndRender();
  } catch (err) {
    console.error(err);
  }
})();
