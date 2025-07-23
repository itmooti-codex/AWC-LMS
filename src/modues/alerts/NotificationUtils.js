export class NotificationUtils {
  static mapSdkNotificationToUi(r) {
    return {
      Alert_Type: r.alert_type,
      Content: r.content,
      Date_Added: r.created_at,
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
    };
  }

  static timeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  }
} 