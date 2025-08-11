// SDK configuration. Fill in your actual slug and apiKey.
export const config = {
  slug: 'eduflowpro',
  apiKey: 'uXVeRpnkFYHhT8SQK6JXo',
};

// Debug flags
export const debug_Notifications = false; // Set to true to log alert query details

// User preference variables (default values)
// These are all to set condtions on fetch alerts
export const user_Preference_Turn_Off_All_Notifications = 'No'; //Turn of all notifications
export const Turn_Off_All_Notifications_Time_Unix = '';//Ignore for now


export const user_Preference_Posts = 'Yes'; //Fetch alerts with type Post
export const user_Preference_Submissions = 'Yes'; //Fetch alerts with type Submission
export const user_Preference_Announcements = 'Yes'; //Fetch alerts with type Announcement

export const user_Preference_Post_Comments = 'Yes'; //Fetch alerts with type Post Comment
export const user_Preference_Submission_Comments = 'Yes'; //Fetch alerts with type Submission Comment
export const user_Preference_Announcement_Comments = 'Yes'; //Fetch alerts with type Announcement Comment

export const user_Preference_Comments_On_My_Posts = 'Yes'; //These fetches comments of post but post author should be logged in user id
export const user_Preference_Comments_On_My_Submissions = 'Yes'; //These fetches comments of submission but submission author should be logged in user id
export const user_Preference_Comments_On_My_Announcements = 'Yes'; //These fetches comments of announcement but announcement author should be logged in user id
//To check author id, we need to fetch auhor id from each parent record from alerts
// like below. these check for author of post, submission, announcement
// Parent_Announcement_Instructor_ID: field(
//   arg: ["Parent_Announcement", "instructor_id"]
// )
// Parent_Post_Author_ID: field(
//   arg: ["Parent_Post", "author_id"]
// )
// Enrolment_Student_ID: field(
//   arg: [
//     "Parent_Submission"
//     "Assessment_Attempt"
//     "Student"
//     "student_id"
//   ]
// )
// but for comments, we need to check the author of parent post or submission or announcement 
// like
// Forum_Post_Author_ID: field(
//   arg: ["Parent_Comment", "Forum_Post", "author_id"]
// )
// Enrolment_Student_ID: field(
//   arg: [
//     "Parent_Comment"
//     "Submissions"
//     "Assessment_Attempt"
//     "Student"
//     "student_id"
//   ]
// )
// Announcement_Instructor_ID: field(
//   arg: [
//     "Parent_Comment"
//     "Announcements"
//     "instructor_id"
//   ]
// )
// here post and comment has author id but announcement has instructor id and submission has student id which are basically same and should match logged in user id


// For these below, we need to check notified contact id and is mentioned flag in alert record and fetch if both are true
export const user_Preference_Post_Mentions = 'Yes'; 
export const user_Preference_Announcement_Mentions = 'Yes';
export const user_Preference_Submission_Mentions = 'Yes';
export const user_Preference_Announcement_Comment_Mentions = 'Yes';
export const user_Preference_Post_Comment_Mentions = 'Yes';
export const user_Preference_Submission_Comment_Mentions = 'Yes';

// these are the alert type values
// Post
// Post Mention
// Post Comment
// Post Comment Mention
// Announcement
// Announcement  Mention
// Announcement Comment
// Announcement Comment Mention
// Announcement Comment Mention
// Submission
// Submission Mention
// Submission Comment
// Submission Comment Mention


// Implement all these in alerts condtions 
