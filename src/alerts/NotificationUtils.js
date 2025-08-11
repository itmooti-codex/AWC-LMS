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

  static getAlertQueryConditions({
    userType, // 'student', 'teacher', 'admin'
    userPreferences = {}, // object with toggle values (Yes/No)
    classIds = [], // array of class IDs
    userId, // logged-in user ID
    turnOffAllNotificationsTimeUnix = null // optional
  }) {
    // Always required: notified_contact_id
    const baseConditions = [
      { where: { notified_contact_id: userId } }
    ];

    // Class ID condition (skip for admin)
    if (userType !== 'admin' && Array.isArray(classIds) && classIds.length > 0) {
      baseConditions.push({ where: { Parent_Class: [{ whereIn: { id: classIds } }] } });
    }

    // Turn off all notifications (after a certain time)
    if (userPreferences.user_Preference_Turn_Off_All_Notifications === 'Yes' && turnOffAllNotificationsTimeUnix) {
      baseConditions.push({ andWhere: { created_at: turnOffAllNotificationsTimeUnix } });
    }

    // Map preferences to alert types
    const alertTypeMap = [
      { pref: 'user_Preference_Posts', type: 'Post' },
      { pref: 'user_Preference_Post_Mentions', type: 'Post Mention' },
      { pref: 'user_Preference_Post_Comments', type: 'Post Comment' },
      { pref: 'user_Preference_Post_Comment_Mentions', type: 'Post Comment Mention' },
      { pref: 'user_Preference_Comments_On_My_Posts', type: 'Post Comment', isMy: true },
      { pref: 'user_Preference_Announcements', type: 'Announcement' },
      { pref: 'user_Preference_Announcement_Mentions', type: 'Announcement Mention' },
      { pref: 'user_Preference_Announcement_Comments', type: 'Announcement Comment' },
      { pref: 'user_Preference_Announcement_Comment_Mentions', type: 'Announcement Comment Mention' },
      { pref: 'user_Preference_Comments_On_My_Announcements', type: 'Announcement Comment', isMy: true },
      { pref: 'user_Preference_Submissions', type: 'Submission' },
      { pref: 'user_Preference_Submission_Mentions', type: 'Submission Mention' },
      { pref: 'user_Preference_Submission_Comments', type: 'Submission Comment' },
      { pref: 'user_Preference_Submission_Comment_Mentions', type: 'Submission Comment Mention' },
      { pref: 'user_Preference_Comments_On_My_Submissions', type: 'Submission Comment', isMy: true },
    ];

    // Collect enabled alert types
    const enabledTypes = [];
    alertTypeMap.forEach(({ pref, type, isMy }) => {
      if (userPreferences[pref] === 'Yes') {
        enabledTypes.push({ type, isMy: !!isMy });
      }
    });

    // Build alert_type conditions
    const typeConditions = [];
    enabledTypes.forEach(({ type, isMy }) => {
      // For "my" content, add extra author check (handled in backend or as a note here)
      if (isMy) {
        // This is a placeholder: actual implementation may require joining parent author fields
        // e.g., { where: { alert_type: type, parent_author_id: userId } }
        typeConditions.push({ where: { alert_type: type, parent_author_id: userId } });
      } else {
        typeConditions.push({ where: { alert_type: type } });
      }
    });

    // If no types enabled, return only base conditions (or empty if "Turn Off All" is set)
    if (userPreferences.user_Preference_Turn_Off_All_Notifications === 'Yes') {
      return baseConditions;
    }
    if (typeConditions.length === 0) {
      return baseConditions;
    }

    // Combine base and type conditions
    return [
      ...baseConditions,
      ...typeConditions
    ];
  }
} 