import { NotificationUtils } from './NotificationUtils.js';

export class NotificationUI {
  static renderNotificationCard(n) {
    return `
      <div class="notification-card${n.Is_Read ? '' : ' unread'}" data-id="${n.ID}" data-url="${n.Origin_URL}">
        <div class="notification-title">${n.Title}
          <span class="notification-date">${NotificationUtils.timeAgo(n.Date_Added * 1000)}</span>
        </div>
        <div class="notification-content">${n.Content}</div>
        <div class="notification-class">Class ID: ${n.Parent_Class_ID ?? ''}</div>
      </div>
    `;
  }

  static renderList(list, container) {
    if (!container) return;
    const html = list.map(NotificationUI.renderNotificationCard).join('') || '<div style="padding:1rem;">No notifications</div>';
    container.innerHTML = html;
  }
}
