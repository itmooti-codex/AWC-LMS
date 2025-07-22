/**
 * Notification Data Model
 *
 * Represents a notification/alert in the LMS system.
 */
class Notification {
  /**
   * @param {Object} params
   * @param {string|number} params.id - Unique identifier for the notification
   * @param {string} params.title - Title of the notification
   * @param {string} params.content - Content/body of the notification
   * @param {Date|string} params.dateAdded - Date the notification was created
   * @param {string|number} params.notifiedContact - User/contact to be notified
   * @param {boolean} params.isMentioned - Whether the user was mentioned
   * @param {boolean} params.isRead - Whether the notification has been read
   * @param {string|number|null} params.parentPost - Related post ID (if any)
   * @param {string|number|null} params.parentAnnouncement - Related announcement ID (if any)
   * @param {string|number|null} params.parentSubmission - Related submission ID (if any)
   * @param {string|number|null} params.parentComment - Related comment ID (if any)
   * @param {string|number} params.classId - Class ID this notification belongs to
   * @param {string} params.url - Origin URL for navigation
   * @param {string} params.type - Type of notification (e.g., Post, Post Mention, Announcement, etc.)
   */
  constructor({
    id,
    title = '',
    content = '',
    dateAdded = new Date(),
    notifiedContact,
    isMentioned = false,
    isRead = false,
    parentPost = null,
    parentAnnouncement = null,
    parentSubmission = null,
    parentComment = null,
    classId,
    url = '',
    type = '',
  }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.dateAdded = dateAdded;
    this.notifiedContact = notifiedContact;
    this.isMentioned = isMentioned;
    this.isRead = isRead;
    this.parentPost = parentPost;
    this.parentAnnouncement = parentAnnouncement;
    this.parentSubmission = parentSubmission;
    this.parentComment = parentComment;
    this.classId = classId;
    this.url = url;
    this.type = type;
  }
}

module.exports = Notification;
