import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';
import { CourseCore } from './CourseCore.js';

(async function main() {
  try {
    const { slug, apiKey } = config;
    const sdk = new VitalStatsSDK({ slug, apiKey });
    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;
    const core = new CourseCore({ plugin, targetElementId: 'navCoursesContainer', limit: 100 });
    core.loadAndRender();
  } catch (err) {
    console.error(err);
  }
})();
