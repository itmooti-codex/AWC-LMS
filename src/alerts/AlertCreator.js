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

// Canonical alert URL builder
// role: 'admin' | 'teachers' | 'students'
// category: 'post' | 'announcement' | 'submission'
// params: { classId, classUid, className, courseUid, eid, postId, commentId, parentPostId, announcementId, lessonUid, assessmentType, subUID, commentScrollID, notType }
function buildAlertUrl(role, category, params = {}) {
  const BASE = 'https://courses.writerscentre.com.au';
  const r = String(role || '').toLowerCase();
  const c = String(category || '').toLowerCase();
  const p = params || {};

  const classId = p.classId;
  const classUid = p.classUid;
  const className = p.className;
  const courseUid = p.courseUid;
  const eid = p.eid;
  const postId = p.postId;
  const commentId = p.commentId;
  const parentPostId = p.parentPostId;
  const announcementId = p.announcementId;
  const lessonUid = p.lessonUid || p.lessonUIDFromPage;
  const assessmentType = p.assessmentType || p.assessmentTypeFromPage;
  const subUID = p.subUID;
  const commentScrollID = p.commentScrollID;
  const notType = p.notType;

  const idForPost = (commentId || parentPostId || postId || '');
  const idForAnnouncement = (announcementId || commentId || '');
  // For submissions: base event -> submissionId; comment -> commentId
  const submissionId = p.submissionId;
  const idForSubmission = (p.isComment ? (commentId || '') : (submissionId || commentId || ''));

  // Admin/Teacher routes
  if (r === 'admin' || r === 'teachers' || r === 'teacher') {
    const roleSeg = (r === 'admin') ? 'admin' : 'teachers';
    if (c === 'post') {
      // Use class unique_id in path for admin/teacher views
      return `${BASE}/${roleSeg}/class/${encodeURIComponent(classUid || '')}?selectedTab=chats?current-post-id=${idForPost}`;
    }
    if (c === 'announcement') {
      // Use class unique_id in path for admin/teacher views
      return `${BASE}/${roleSeg}/class/${encodeURIComponent(classUid || '')}?selectedTab=announcements?data-announcement-template-id=${idForAnnouncement}`;
    }
    if (c === 'submission') {
      const base = new URL(`${BASE}/course-details/content/${encodeURIComponent(lessonUid || '')}`);
      const params = new URLSearchParams();
      params.set('submissionPostIs', String(idForSubmission || ''));
      if (assessmentType === 'File Submission') {
        if (subUID) params.set('subUID', String(subUID));
        if (commentScrollID) params.set('commentScrollId', String(commentScrollID));
      }
      if (classId != null) params.set('classIdFromUrl', String(classId));
      if (className) params.set('className', String(className));
      if (classUid) params.set('classUid', String(classUid));
      if (classId != null) params.set('currentClassID', String(classId));
      if (className) params.set('currentClassName', String(className));
      if (classUid) params.set('currentClassName', String(className));
      return `${base.toString()}?${params.toString()}`;
    }
  }

  // Student routes
  if (r === 'students' || r === 'student') {
    if (c === 'post') {
      const base = `${BASE}/students/course-details/${encodeURIComponent(courseUid || '')}`;
      const qs = new URLSearchParams();
      if (eid) qs.set('eid', String(eid));
      qs.set('selectedTab', 'courseChat');
      qs.set('current-post-id', String(idForPost || ''));
      if (classId != null) qs.set('classIdFromUrl', String(classId));
      if (className) qs.set('className', String(className));
      if (classUid) qs.set('classUid', String(classUid));
      if (classId != null) qs.set('currentClassID', String(classId));
      if (className) qs.set('currentClassName', String(className));
      if (classUid) qs.set('currentClassUniqueID', String(classUid));
      return `${base}?${qs.toString()}`;
    }
    if (c === 'announcement') {
      // Note: README uses 'anouncemnt' (typo) in selectedTab; preserve as-is
      const base = `${BASE}/students/course-details/${encodeURIComponent(courseUid || '')}`;
      const qs = new URLSearchParams();
      if (eid) qs.set('eid', String(eid));
      qs.set('selectedTab', 'anouncemnt');
      // README chains another '?' before parameter; we build as proper query
      qs.set('data-announcement-template-id', String(idForAnnouncement || ''));
      if (classId != null) qs.set('classIdFromUrl', String(classId));
      if (className) qs.set('className', String(className));
      if (classUid) qs.set('classUid', String(classUid));
      if (classId != null) qs.set('currentClassID', String(classId));
      if (className) qs.set('currentClassName', String(className));
      if (classUid) qs.set('currentClassUniqueID', String(classUid));
      return `${base}?${qs.toString()}`;
    }
    if (c === 'submission') {
      const base = `${BASE}/course-details/content/${encodeURIComponent(lessonUid || '')}`;
      const qs = new URLSearchParams();
      if (eid) qs.set('eid', String(eid));
      if (classId != null) qs.set('classIdFromUrl', String(classId));
      if (className) qs.set('className', String(className));
      if (classUid) qs.set('classUid', String(classUid));
      if (classId != null) qs.set('currentClassID', String(classId));
      if (className) qs.set('currentClassName', String(className));
      if (classUid) qs.set('currentClassUniqueID', String(classUid));
      qs.set('submissionPostIs', String(idForSubmission || ''));
      if (assessmentType === 'File Submission') {
        if (subUID) qs.set('subUID', String(subUID));
        if (commentScrollID) qs.set('commentScrollId', String(commentScrollID));
      }
      if (notType) qs.set('notType', String(notType));
      return `${base}?${qs.toString()}`;
    }
  }
  // Fallback: current location (normalized) if we cannot build
  try { const u = new URL(window.location.href); u.search=''; u.hash=''; return u.toString(); } catch(_) { return window.location.href; }
}

window.AWC.buildAlertUrl = buildAlertUrl;
