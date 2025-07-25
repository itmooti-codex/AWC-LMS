import { config } from '../../sdk/config.js';
import { VitalStatsSDK } from '../../sdk/init.js';
import { NotificationCore } from './NotificationCore.js';
import { NotificationUI } from './NotificationUI.js';
import { NotificationUtils } from './NotificationUtils.js';
import { UserConfig } from './userConfig.js';
import { initDOMInteractions } from './dom/DomInit.js';

const { slug, apiKey } = config;



(async function main() {
  try {
    // Initialize SDK
    const sdk = new VitalStatsSDK({ slug, apiKey });
    const plugin = await sdk.initialize();
    window.tempPlugin ??= plugin;
    loadCourses(plugin);

    const navEl = document.getElementById('navbar-notifications-list');
    if (navEl) {
      const navCore = new NotificationCore({ plugin, limit: 5, targetElementId: 'navbar-notifications-list' });
      await navCore.initialFetch();
      navCore.subscribeToUpdates();
      window.navNotificationCore = navCore;
    }

    const bodyEl = document.getElementById('body-notifications-list');
    if (bodyEl) {
      const bodyCore = new NotificationCore({ plugin, limit: 5000, targetElementId: 'body-notifications-list' });
      await bodyCore.initialFetch();
      bodyCore.subscribeToUpdates();
      window.bodyNotificationCore = bodyCore;
    }

    function handleCardClick(e) {
      const card = e.target.closest('.notification-card');
      if (!card) return;
      const id = card.dataset.id;
      const url = card.dataset.url;
      if (!id) return;
      markAsRead(id).finally(() => {
        card.classList.remove('unread');
      });
      if (url) window.open(url, '_blank');
    }

    async function markAsRead(id) {
      try {
        await plugin
          .mutation()
          .switchTo('EduflowproAlert')
          .update(q => q.where('id', Number(id)).set({ is_read: true }))
          .execute(true)
          .toPromise();
        window.navNotificationCore?.forceRefresh();
        window.bodyNotificationCore?.forceRefresh();
      } catch (err) {
        console.error(err);
      }
    }

    async function markAllAsRead() {
      try {
        await plugin
          .mutation()
          .switchTo('EduflowproAlert')
          .update(q => q.where('is_read', false).set({ is_read: true }))
          .execute(true)
          .toPromise();
        window.navNotificationCore?.forceRefresh();
        window.bodyNotificationCore?.forceRefresh();
      } catch (err) {
        console.error(err);
      }
    }

    navEl?.addEventListener('click', handleCardClick);
    bodyEl?.addEventListener('click', handleCardClick);
    document.getElementById('navbar-mark-all')?.addEventListener('click', (e) => { e.stopPropagation(); markAllAsRead(); });
    document.getElementById('body-mark-all')?.addEventListener('click', markAllAsRead);

    // Expose utils
    window.NotificationUI = NotificationUI;
    window.NotificationUtils = NotificationUtils;
  } catch (err) {
    console.error(err);
    const bodyList = document.getElementById('body-notifications-list');
    if (bodyList) bodyList.innerHTML = '<div style="color:red;">Failed to load notifications.</div>';
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  initDOMInteractions();
});

async function loadCourses(plugin) {
  const container = document.getElementById('navCoursesContainer');
  if (!container) return;
  try {
    const userConfig = new UserConfig();
    const studentId = userConfig.userId;
    const gql = `query getEnrolments($student_id: AwcContactID) {
  getEnrolments(
    query: [
      { where: { student_id: $student_id } }
      {
        andWhereGroup: [
          { where: { status: "Active" } }
          { orWhere: { status: "New" } }
        ]
      }
      {
        andWhere: {
          Course: [
            {
              whereNot: {
                course_name: null
                _OPERATOR_: isNull
              }
            }
          ]
        }
      }
    ]
  ) {
    ID: id
    Course {
      unique_id
      course_name
      image
    }
    Class {
      id
      unique_id
    }
  }
}`;

    const query = plugin.switchTo('AwcEnrolment').query().fromGraphql(gql);
    await query
      .fetch({ variables: { student_id: Number(studentId) } })
      .pipe(window.toMainInstance(true))
      .toPromise();
    const recs = query.getAllRecordsArray();
    renderCourses(recs);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="p-2 text-red-500">Failed to load courses.</div>';
  }
}

function renderCourses(enrolments) {
  const container = document.getElementById('navCoursesContainer');
  if (!container) return;
  const html = (enrolments || [])
    .map(e => {
      const c = e.Course || {};
      const name = c.course_name || '';
      const img = c.image || '';
      return `<div class="flex items-center gap-2 p-2 hover:bg-gray-100">`+
        `<img src="${img}" alt="${name}" class="w-6 h-6 rounded object-cover" />`+
        `<span class="text-sm">${name}</span>`+
      `</div>`;
    })
    .join('');
  container.innerHTML = html || '<div class="p-2 text-sm text-gray-500">No courses</div>';
}

