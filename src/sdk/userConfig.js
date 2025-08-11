import {
  user_Preference_Turn_Off_All_Notifications,
  Turn_Off_All_Notifications_Time_Unix,
  user_Preference_Posts,
  user_Preference_Post_Comments,
  user_Preference_Comments_On_My_Posts,
  user_Preference_Submissions,
  user_Preference_Submission_Comments,
  user_Preference_Comments_On_My_Submissions,
  user_Preference_Announcements,
  user_Preference_Announcement_Comments,
  user_Preference_Comments_On_My_Announcements,
  user_Preference_Announcement_Mentions,
  user_Preference_Announcement_Comment_Mentions,
  user_Preference_Post_Mentions,
  user_Preference_Post_Comment_Mentions,
  user_Preference_Submission_Mentions,
  user_Preference_Submission_Comment_Mentions
} from './config.js';

export class UserConfig {
    constructor() {
        this.userId = window.loggedinuserid ??= 62;
        this.userType = window.loggedinuserType ??= "Student";

        // Preferences (merge field values resolved already into constants)
        this.preferences = {
            turnOffAllNotifications: user_Preference_Turn_Off_All_Notifications, //Stops fetching notifications completely
            turnOffAllNotificationsTimeUnix: Turn_Off_All_Notifications_Time_Unix, //We will not use it now

            posts: user_Preference_Posts, //Fetch only posts type        
            submissions: user_Preference_Submissions, //Fetch only submissions type
            announcements: user_Preference_Announcements, //Fetch only announcements type

            postComments: user_Preference_Post_Comments, //Fetch only post comments type
            commentsOnMyPosts: user_Preference_Comments_On_My_Posts, //Fetch only comments on my posts type
            submissionComments: user_Preference_Submission_Comments, //Fetch only submission comments type
            commentsOnMySubmissions: user_Preference_Comments_On_My_Submissions, //Fetch only comments on my submissions type
            announcementComments: user_Preference_Announcement_Comments, //Fetch only announcement comments type
            commentsOnMyAnnouncements: user_Preference_Comments_On_My_Announcements, //Fetch only comments on my announcements type

            postMentions: user_Preference_Post_Mentions, //Fetch only post mentions type
            postCommentMentions: user_Preference_Post_Comment_Mentions, //Fetch only post comment mentions type
            submissionMentions: user_Preference_Submission_Mentions, //Fetch only submission mentions type
            submissionCommentMentions: user_Preference_Submission_Comment_Mentions, //Fetch only submission comment mentions type
            announcementMentions: user_Preference_Announcement_Mentions, //Fetch only announcement mentions type
            announcementCommentMentions: user_Preference_Announcement_Comment_Mentions, //Fetch only announcement comment mentions type
        };
    }
}
