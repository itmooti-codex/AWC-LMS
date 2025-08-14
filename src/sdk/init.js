// SDK loader and initializer as a reusable class
export class VitalStatsSDK {
  constructor({ slug, apiKey }) {
    this.slug = slug;
    this.apiKey = apiKey;
    this.plugin = null;
  }

  async loadScript() {
    if (window.initVitalStats || window.initVitalStatsSDK) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://static-au03.vitalstats.app/static/sdk/v1/latest.js';
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async initialize() {
    await this.loadScript();
    const initFn = window.initVitalStats || window.initVitalStatsSDK;
    if (!initFn) throw new Error('VitalStats init fn missing');
    const { plugin } = await initFn({ slug: this.slug, apiKey: this.apiKey, isDefault: true }).toPromise();

    // Build model maps by Ontraport objectId and attach helper switchers
    try {
      const models = (typeof plugin.getState === 'function') ? plugin.getState() : {};
      const MODELS_BY_ID = {};
      const MODEL_NAMES = {};
      let schema, props;
      for (const modelName in models) {
        try {
          schema = models[modelName]?.schema;
          props = schema?.props;
          if (props && props.dataSourceType === 'ontraport' && props.objectId != null) {
            MODELS_BY_ID[String(props.objectId)] = schema.name;
          }
        } catch (_) { /* ignore */ }
      }

      // Try to infer common AWC model IDs by name (one-time discovery)
      const inferIdByName = (wantName) => {
        try {
          for (const modelName in models) {
            const s = models[modelName]?.schema;
            if (s?.name === wantName && s?.props?.objectId != null) return String(s.props.objectId);
          }
        } catch (_) {}
        return undefined;
      };

      const inferredIds = {
        ALERT: inferIdByName('AwcAlert'),
        CLASS: inferIdByName('AwcClass'),
        ENROLMENT: inferIdByName('AwcEnrolment'),
      };

      // Merge with any pre-provided IDs on window (if present)
      const existingIds = (window && window.MODEL_IDS && typeof window.MODEL_IDS === 'object') ? window.MODEL_IDS : {};
      const MODEL_IDS = { ...inferredIds, ...existingIds };

      // Build constant -> schema.name map when we have id and name
      Object.keys(MODEL_IDS).forEach((key) => {
        const id = MODEL_IDS[key];
        const name = id != null ? MODELS_BY_ID[String(id)] : undefined;
        if (name) MODEL_NAMES[key] = name;
      });

      // Attach helpers to plugin instance
      Object.defineProperties(plugin, {
        MODELS_BY_ID: { value: MODELS_BY_ID, enumerable: false, configurable: true, writable: false },
        MODEL_IDS: { value: MODEL_IDS, enumerable: false, configurable: true, writable: true },
        MODEL_NAMES: { value: MODEL_NAMES, enumerable: false, configurable: true, writable: true },
      });

      // Helper: resolve a key to a model name (schema.name)
      const resolveModelName = (key) => {
        if (key == null) return undefined;
        // If key matches a known identifier
        if (typeof key === 'string' && plugin.MODEL_IDS && key in plugin.MODEL_IDS) {
          const id = plugin.MODEL_IDS[key];
          return (id != null) ? plugin.MODELS_BY_ID[String(id)] : undefined;
        }
        // If key is numeric (objectId)
        const asStr = String(key);
        if (/^\d+$/.test(asStr)) return plugin.MODELS_BY_ID[asStr];
        // Otherwise, assume it's already a schema name
        return asStr;
      };

      // Add switch helpers
      const switchToId = (key) => {
        const name = resolveModelName(key);
        if (!name) throw new Error(`Model not found for key: ${key}`);
        if (typeof plugin.switchTo !== 'function') throw new Error('SDK plugin.switchTo unavailable');
        return plugin.switchTo(name);
      };

      // Attach bound methods
      plugin.switchToId = switchToId;
      plugin.switchToIdentifier = switchToId;

      // Expose on window for convenient reuse
      window.MODEL_IDS = MODEL_IDS;
      window.MODEL_NAMES = MODEL_NAMES;
    } catch (e) {
      // Non-fatal: mapping helpers unavailable
      // console.warn('Model mapping init failed', e);
    }

    this.plugin = plugin;
    return plugin;
  }
}
