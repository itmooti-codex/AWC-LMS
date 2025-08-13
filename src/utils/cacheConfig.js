// Centralized cache TTLs with optional runtime override via window.AWC.cacheTTLs
// Values are in milliseconds
const defaults = {
  courses: {
    nav: 2 * 60 * 1000,   // 2 minutes
    home: 5 * 60 * 1000,  // 5 minutes
  },
  alerts: {
    nav: 2 * 60 * 1000,   // 2 minutes
    body: 3 * 60 * 1000,  // 3 minutes
  },
};

function get(ttlPath, fallback) {
  try {
    const override = (window.AWC && window.AWC.cacheTTLs) || {};
    const parts = ttlPath.split('.');
    let node = override;
    for (const p of parts) {
      node = node?.[p];
      if (node == null) break;
    }
    const val = (node == null) ? undefined : Number(node);
    return Number.isFinite(val) && val >= 0 ? val : fallback;
  } catch (_) {
    return fallback;
  }
}

export const CacheTTLs = {
  courses: {
    nav: () => get('courses.nav', defaults.courses.nav),
    home: () => get('courses.home', defaults.courses.home),
  },
  alerts: {
    nav: () => get('alerts.nav', defaults.alerts.nav),
    body: () => get('alerts.body', defaults.alerts.body),
  },
};

