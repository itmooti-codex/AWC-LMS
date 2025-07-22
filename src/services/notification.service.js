/**
 * NotificationService (Mock)
 *
 * Provides methods to fetch and filter notifications using mock data.
 * Follows SDK/GraphQL style for future integration.
 */
const Notification = require('../models/notification.model');

// Mock data (replace with SDK/GraphQL queries in production)
const mockNotifications = [
  new Notification({
    id: 1,
    title: 'A post has been created',
    content: 'Parent post content',
    dateAdded: new Date('2024-06-01T10:00:00Z'),
    notifiedContact: 74,
    isMentioned: false,
    isRead: false,
    parentPost: 100,
    parentAnnouncement: null,
    parentSubmission: null,
    parentComment: null,
    classId: 'class-1',
    url: 'https://example.com/post/100',
    type: 'Post',
  }),
  new Notification({
    id: 2,
    title: 'You have been mentioned in a contact',
    content: 'Parent post content',
    dateAdded: new Date('2024-06-02T12:00:00Z'),
    notifiedContact: 76,
    isMentioned: true,
    isRead: false,
    parentPost: 100,
    parentAnnouncement: null,
    parentSubmission: null,
    parentComment: null,
    classId: 'class-1',
    url: 'https://example.com/post/100',
    type: 'Post Mention',
  }),
  // ...add more mock notifications as needed
];

class NotificationService {
  /**
   * Fetch all notifications (mock)
   * @returns {Notification[]}
   */
  static fetchAll() {
    return mockNotifications;
  }

  /**
   * Fetch notifications for a specific user/contact
   * @param {string|number} userId
   * @returns {Notification[]}
   */
  static fetchByUser(userId) {
    return mockNotifications.filter(n => n.notifiedContact === userId);
  }

  /**
   * Filter notifications by read/unread status
   * @param {boolean} isRead
   * @param {Notification[]} notifications
   * @returns {Notification[]}
   */
  static filterByRead(isRead, notifications = mockNotifications) {
    return notifications.filter(n => n.isRead === isRead);
  }

  /**
   * Filter notifications by type (e.g., 'All', 'Announcement', etc.)
   * @param {string} type
   * @param {Notification[]} notifications
   * @returns {Notification[]}
   */
  static filterByType(type, notifications = mockNotifications) {
    if (type === 'All') return notifications;
    return notifications.filter(n => n.type === type);
  }

  /**
   * Get the latest 20 notifications (for navbar)
   * @param {Notification[]} notifications
   * @returns {Notification[]}
   */
  static getLatest20(notifications = mockNotifications) {
    return [...notifications]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 20);
  }

  /**
   * Get all notifications with pagination (for body)
   * @param {number} page
   * @param {number} pageSize
   * @param {Notification[]} notifications
   * @returns {{ data: Notification[], total: number, page: number, pageSize: number }}
   */
  static getPaginated(page = 1, pageSize = 20, notifications = mockNotifications) {
    const sorted = [...notifications].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: sorted.slice(start, end),
      total: sorted.length,
      page,
      pageSize,
    };
  }
}

module.exports = NotificationService;
