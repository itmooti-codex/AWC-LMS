export class UserConfig {
    constructor() {
        this.userId = window.loggedinuserid ??= 62;

        // Preferences
        this.preferences = {
            posts: "No",
            submissions: "No",
            announcements: "No",

            postComments: "No",
            commentsOnMyPosts: "Yes",
            submissionComments: "No",
            commentsOnMySubmissions: "Yes",
            announcementComments: "No",
            commentsOnMyAnnouncements: "Yes",

            postMentions: "Yes",
            postCommentMentions: "Yes",
            submissionMentions: "Yes",
            submissionCommentMentions: "Yes",
            announcementMentions: "Yes",
            announcementCommentMentions: "Yes",
        };
    }
}


// sample condtion
// query: [{ where: { alert_type: "Announcement" } }]


// Foolowing values are accepted by alert type
// Post
// Post Mention
// Post Comment
// Post Comment Mention

// Submission
// Submission Mention
// Submission Comment
// Submission Comment Mention

// Announcement
// Announcement Mention
// Announcement Comment
// Announcement Comment Mention
