import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';

let cachedPlugin = null;

async function getPlugin() {
  if (cachedPlugin && typeof cachedPlugin.mutation === 'function') return cachedPlugin;
  if (window.tempPlugin && typeof window.tempPlugin.mutation === 'function') {
    cachedPlugin = window.tempPlugin;
    return cachedPlugin;
  }
  const sdk = new VitalStatsSDK({ slug: config.slug, apiKey: config.apiKey });
  const plugin = await sdk.initialize();
  window.tempPlugin ??= plugin;
  cachedPlugin = plugin;
  return plugin;
}

const ALLOWED_FIELDS = new Set([
  'alert_type',
  'content',
  'created_at',
  'is_mentioned',
  'is_read',
  'notified_contact_id',
  'origin_url',
  'origin_url_teacher',
  'origin_url_admin',
  'parent_announcement_id',
  'parent_class_id',
  'parent_comment_id',
  'parent_post_id',
  'parent_submission_id',
  'title',
]);

export function buildAlertPayload(payload = {}) {
  const out = {};
  Object.keys(payload || {}).forEach(k => {
    if (ALLOWED_FIELDS.has(k)) out[k] = payload[k];
  });
  return out;
}

async function tryCreateViaMutation(plugin, payload) {
  if (!plugin || typeof plugin.mutation !== 'function') {
    throw new Error('SDK mutation helper unavailable');
  }

  const resolveModelName = () => {
    try {
      if (plugin.MODEL_NAMES && plugin.MODEL_NAMES.ALERT) return plugin.MODEL_NAMES.ALERT;
    } catch (_) {}
    try {
      // Try to find by common schema name
      const models = (typeof plugin.getState === 'function') ? plugin.getState() : {};
      for (const modelName in models) {
        if (modelName === 'AwcAlert') return modelName;
      }
    } catch (_) {}
    return 'AwcAlert';
  };

  // Prefer switchToId when available and resolvable; otherwise fallback to switchTo(schemaName)
  const tryWith = async (useId) => {
    const m = plugin.mutation();
    const target = useId ? m.switchToId('ALERT') : m.switchTo(resolveModelName());
    try {
      // Strategy 1: insert([...])
      const res = await target
        .insert(q => q.values([payload]))
        .execute(true)
        .toPromise();
      return res;
    } catch (_) {}
    // Strategy 2: create([...])
    const res = await target
      .create(q => q.values([payload]))
      .execute(true)
      .toPromise();
    return res;
  };

  try {
    return await tryWith(true);
  } catch (_) {
    // Fall back to using schema name directly
    return await tryWith(false);
  }
}

async function tryCreateViaGraphQL(plugin, payload) {
  if (!plugin.graphql) throw new Error('SDK GraphQL helper unavailable');
  const query = `mutation createAlert($payload: AlertCreateInput) {\n  createAlert(payload: $payload) { id title alert_type created_at }\n}`;
  const res = await plugin.graphql(query, { payload });
  // Some SDKs return Observables
  if (res && typeof res.toPromise === 'function') return res.toPromise();
  return res;
}

export async function createAlert(payload = {}) {
  const plugin = await getPlugin();
  const clean = buildAlertPayload(payload);
  try {
    return await tryCreateViaMutation(plugin, clean);
  } catch (_) {
    return await tryCreateViaGraphQL(plugin, clean);
  }
}

export async function createAlerts(payloads = [], { concurrency = 3 } = {}) {
  const plugin = await getPlugin();
  const list = Array.isArray(payloads) ? payloads : [payloads];
  let idx = 0;
  const errors = [];
  async function worker() {
    while (idx < list.length) {
      const i = idx++;
      const p = buildAlertPayload(list[i]);
      try {
        await tryCreateViaMutation(plugin, p);
      } catch (_) {
        try { await tryCreateViaGraphQL(plugin, p); } catch (e) { errors.push({ index: i, error: e }); }
      }
    }
  }
  const pool = Array.from({ length: Math.max(1, Number(concurrency) || 1) }, () => worker());
  await Promise.all(pool);
  return { total: list.length, failed: errors.length, errors };
}

// Expose global helpers for convenient usage across the app
window.AWC ??= {};
window.AWC.createAlert = createAlert;
window.AWC.createAlerts = createAlerts;
window.AWC.buildAlertPayload = buildAlertPayload;
