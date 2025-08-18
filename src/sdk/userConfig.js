const debug_Notifications = false;
const user_Preference_Turn_Off_All_Notifications = 'No';
const Turn_Off_All_Notifications_Time_Unix = '';
const user_Preference_Posts = 'Yes';
const user_Preference_Submissions = 'Yes';
const user_Preference_Announcements = 'Yes';
const user_Preference_Post_Comments = 'Yes';
const user_Preference_Submission_Comments = 'Yes';
const user_Preference_Announcement_Comments = 'Yes';
const user_Preference_Comments_On_My_Posts = 'Yes';
const user_Preference_Comments_On_My_Submissions = 'Yes';
const user_Preference_Comments_On_My_Announcements = 'Yes';
const user_Preference_Post_Mentions = 'Yes';
const user_Preference_Announcement_Mentions = 'Yes';
const user_Preference_Submission_Mentions = 'Yes';
const user_Preference_Announcement_Comment_Mentions = 'Yes';
const user_Preference_Post_Comment_Mentions = 'Yes';
const user_Preference_Submission_Comment_Mentions = 'Yes';

export class UserConfig {
  constructor() {
    this.userId = window.loggedinuserid ??= 10435;
    this.userType = window.loggedinuserType ??= "Admin";
    this.debug = {
      notifications: debug_Notifications,
    };

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
