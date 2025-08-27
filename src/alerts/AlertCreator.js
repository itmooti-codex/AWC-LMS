// Alerts Creator: direct GraphQL (no SDK)

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

// Simple sleep helper
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Determine if an error is fatal (should not be retried)
function isFatalError(err) {
  try {
    // HTTP-style status codes
    const status = err?.status || err?.response?.status || err?.code;
    if (status && [400, 401, 403, 404, 409, 422].includes(Number(status))) return true;
    const msg = String(err?.message || '').toLowerCase();
    // Common validation/authorization keywords
    const fatalHints = [
      'validation',
      'invalid',
      'unauthorized',
      'forbidden',
      'not found',
      'schema',
      'payload',
      'required',
      'must ',
      'missing',
    ];
    if (fatalHints.some((h) => msg.includes(h))) return true;
    // GraphQL errors array
    const gqlErrors = err?.graphQLErrors || err?.errors;
    if (Array.isArray(gqlErrors) && gqlErrors.length) {
      const combined = gqlErrors.map((e) => String(e?.message || '').toLowerCase()).join(' | ');
      if (fatalHints.some((h) => combined.includes(h))) return true;
    }
  } catch (_) {}
  return false;
}

// Retry helper: keeps retrying until success or deemed fatal
async function retryUntilSuccess(fn, {
  initialDelayMs = 500,
  maxDelayMs = 30_000,
  factor = 2,
  jitter = 0.2,
  maxAttempts = Infinity,
  onRetry,
  isFatal = isFatalError,
} = {}) {
  let attempt = 0;
  let delay = Math.max(0, Number(initialDelayMs) || 0);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn(attempt);
    } catch (err) {
      attempt += 1;
      if (typeof isFatal === 'function' && isFatal(err)) throw err;
      if (Number.isFinite(maxAttempts) && attempt >= maxAttempts) throw err;
      // Backoff with jitter
      let sleepMs = delay;
      if (sleepMs > 0 && Number(jitter) > 0) {
        const j = Math.max(0, Number(jitter));
        const delta = sleepMs * j;
        sleepMs = Math.max(0, Math.round(sleepMs - delta + Math.random() * (2 * delta)));
      }
      if (typeof onRetry === 'function') {
        try { onRetry(err, attempt, sleepMs); } catch (_) {}
      }
      if (sleepMs > 0) await sleep(sleepMs);
      delay = Math.min(maxDelayMs, Math.max(0, Math.round(delay * (factor || 1) || 0)) || sleepMs || initialDelayMs || 500);
    }
  }
}

// Basic GraphQL fetcher using globals (courseChat context)
async function gqlFetch(query, variables = {}) {
  const endpoint = window.graphqlApiEndpoint || (typeof graphqlApiEndpoint !== 'undefined' ? graphqlApiEndpoint : null);
  const apiKey = window.apiAccessKey || (typeof apiAccessKey !== 'undefined' ? apiAccessKey : null);
  if (!endpoint || !apiKey) throw new Error('GraphQL endpoint or API key not configured');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  const json = await res.json();
  if (json && Array.isArray(json.errors) && json.errors.length) {
    const err = new Error(json.errors.map(e => e.message).join(' | '));
    err.status = 200;
    err.errors = json.errors;
    throw err;
  }
  return json?.data || null;
}

export async function createAlert(payload = {}) {
  const clean = buildAlertPayload(payload);
  const cfg = (window?.AWC?.alertsRetryConfig) || {};
  const query = `mutation createAlerts($payload: [AlertCreateInput] = null) {\n  createAlerts(payload: $payload) { is_mentioned }\n}`;
  return retryUntilSuccess(async () => {
    const data = await gqlFetch(query, { payload: [clean] });
    return data?.createAlerts;
  }, cfg);
}

export async function createAlerts(payloads = []) {
  const list = Array.isArray(payloads) ? payloads : [payloads];
  const clean = list.map(buildAlertPayload);
  const cfg = (window?.AWC?.alertsRetryConfig) || {};
  const query = `mutation createAlerts($payload: [AlertCreateInput] = null) {\n  createAlerts(payload: $payload) { is_mentioned }\n}`;
  return retryUntilSuccess(async () => {
    const data = await gqlFetch(query, { payload: clean });
    return data?.createAlerts;
  }, cfg);
}

// Expose global helpers for convenient usage across the app
window.AWC ??= {};
window.AWC.createAlert = createAlert;
window.AWC.createAlerts = createAlerts;
window.AWC.buildAlertPayload = buildAlertPayload;

// Canonical alert URL builder
// role: 'admin' | 'teacher' | 'students'
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
  // For submissions: submissionPostIs should always be the submission id;
  // scrolling is handled via commentScrollId when present.
  const idForSubmission = (submissionId || commentId || '');

  // Admin/Teacher routes
  if (r === 'admin' || r === 'teachers' || r === 'teacher') {
    // Per requirement: teacher and admin use the SAME URL format for announcements,
    // and values are stored into separate fields (origin_url_teacher, origin_url_admin)
    if (c === 'announcement') {
      // Use class unique_id in path (not numeric id)
      const classIdentifier = classUid; // required unique id
      const templateId = (commentId != null && Number(commentId) > 0) ? commentId : idForAnnouncement;
      return `${BASE}/admin/class/${encodeURIComponent(classIdentifier || '')}?selectedTab=announcements?data-announcement-template-id=${templateId || ''}`;
    }
    if (c === 'post') {
      // Preserve previous behavior for posts
      const roleSeg = (r === 'admin') ? 'admin' : 'teacher';
      return `${BASE}/${roleSeg}/class/${encodeURIComponent(classUid || '')}?selectedTab=chats?current-post-id=${idForPost}`;
    }
    if (c === 'submission') {
      // Keep previous behavior intact for submissions
      const base = `${BASE}/course-details/content/${encodeURIComponent(lessonUid || '')}`;
      const qs = new URLSearchParams();
      qs.set('submissionPostIs', String(idForSubmission || ''));
      if (assessmentType === 'File Submission') {
        qs.set('subUID', String(subUID));
        qs.set('commentScrollId', String(commentScrollID));
      }
      if (classId != null) qs.set('classIdFromUrl', String(classId));
      if (className) qs.set('className', String(className));
      if (classUid) qs.set('classUid', String(classUid));
      if (classId != null) qs.set('currentClassID', String(classId));
      if (className) qs.set('currentClassName', String(className));
      return `${base}?${qs.toString()}`;
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
        // Always include keys even if values are undefined, per spec
        qs.set('subUID', String(subUID));
        qs.set('commentScrollId', String(commentScrollID));
      }
      if (notType) qs.set('notType', String(notType));
      return `${base}?${qs.toString()}`;
    }
  }
  // Fallback: current location (normalized) if we cannot build
  try { const u = new URL(window.location.href); u.search=''; u.hash=''; return u.toString(); } catch(_) { return window.location.href; }
}

window.AWC.buildAlertUrl = buildAlertUrl;
