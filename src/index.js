import { config } from './config/index.js';
const { slug, apiKey } = config;

// =====================
// SDK Loader
// =====================
async function loadSdkScript() {
  if (window.initVitalStatsSDK) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://static-au03.vitalstats.app/static/sdk/v1/latest.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function initializeSdk() {
  await loadSdkScript();
  if (!window.initVitalStatsSDK) {
    throw new Error('VitalStats SDK failed to load');
  }
  return window.initVitalStatsSDK({
    slug,
    apiKey,
    isDefault: true,
  })
    .toPromise()
    .then(({ plugin }) => plugin);
}

// =====================
// Notification Fetch
// =====================
async function fetchNotifications(plugin, { limit = 100, offset = 0 } = {}) {
  // The model name may vary; update if needed
  const alertsModel = plugin.switchTo('EduflowproAlert');
  const query = alertsModel.query()
    .limit(limit)
    .offset(offset)
    .orderBy([{ path: ['created_at'], type: 'desc' }]);
  const payload = await query.fetch();
  const records = Object.values(payload.records || {});
  return records.map(mapSdkNotificationToUi);
}

// =====================
// Rendering
// =====================
function renderNotifications(notifications) {
  const navbarList = document.getElementById('navbar-notifications-list');
  const bodyList = document.getElementById('body-notifications-list');
  navbarList.innerHTML = notifications.slice(0, 20).map(renderNotificationCard).join('') || '<div style="padding:1rem;">No notifications</div>';
  bodyList.innerHTML = notifications.map(renderNotificationCard).join('') || '<div style="padding:1rem;">No notifications</div>';
}

// =====================
// Main Entry
// =====================
(async function main() {
  try {
    const plugin = await initializeSdk();
    window.plugin = plugin;
    const notifications = await fetchNotifications(plugin, { limit: 100 });
    renderNotifications(notifications);
  } catch (err) {
    console.error('Error initializing or fetching notifications:', err);
    const bodyList = document.getElementById('body-notifications-list');
    if (bodyList) bodyList.innerHTML = '<div style="color:red;">Failed to load notifications.</div>';
  }
})();

// =====================
// Utilities
// =====================
function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

function renderNotificationCard(n) {
  return `
    <div class="notification-card${n.Is_Read ? '' : ' unread'}" onclick="window.open('${n.Origin_URL}', '_blank')">
      <div class="notification-title">${n.Title}
        <span class="notification-date">${timeAgo(n.Date_Added * 1000)}</span>
      </div>
      <div class="notification-content">${n.Content}</div>
      <div class="notification-class">Class ID: ${n.Parent_Class_ID ?? ''}</div>
    </div>
  `;
}

function mapSdkNotificationToUi(r) {
  return {
    Alert_Type: r.alert_type,
    Content: r.content,
    Date_Added: r.created_at,
    Date_Modified: r.last_modified_at,
    ID: r.id,
    Is_Mentioned: r.is_mentioned,
    Is_Read: r.is_read,
    Notified_Contact_ID: r.notified_contact_id,
    Origin_URL: r.origin_url,
    Parent_Announcement_ID: r.parent_announcement_id,
    Parent_Class_ID: r.parent_class_id,
    Parent_Comment_ID: r.parent_comment_id,
    Parent_Post_ID: r.parent_post_id,
    Parent_Submission_ID: r.parent_submission_id,
    Title: r.title,
    Unique_ID: r.unique_id,
    externalRawDataStatus: r.externalRawDataStatus,
  };
}
