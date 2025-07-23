import { NotificationUtils } from './NotificationUtils.js';

export class NotificationUI {
  static renderNotificationCard(n) {
    return `
      <div class="notification-card${n.Is_Read ? '' : ' unread'}" onclick="window.open('${n.Origin_URL}', '_blank')">
        <div class="notification-title">${n.Title}
          <span class="notification-date">${NotificationUtils.timeAgo(n.Date_Added * 1000)}</span>
        </div>
        <div class="notification-content">${n.Content}</div>
        <div class="notification-class">Class ID: ${n.Parent_Class_ID ?? ''}</div>
      </div>
    `;
  }

  static renderNotifications(list) {
    const navbarList = document.getElementById('navbar-notifications-list');
    const bodyList = document.getElementById('body-notifications-list');
    const navbarHTML = list.slice(0, 5).map(NotificationUI.renderNotificationCard).join('') || '<div style="padding:1rem;">No notifications</div>';
    const bodyHTML = list.map(NotificationUI.renderNotificationCard).join('') || '<div style="padding:1rem;">No notifications</div>';
    navbarList && (navbarList.innerHTML = navbarHTML);
    bodyList && (bodyList.innerHTML = bodyHTML);
  }
} 