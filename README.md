<script> 
const debug_Notifications = false; 
const user_Preference_Turn_Off_All_Notifications = "No"; 
const Turn_Off_All_Notifications_Time_Unix = "1753161343524"; 
const user_Preference_Posts = "Yes"; 
const user_Preference_Post_Comments = "No"; 
const user_Preference_Comments_On_My_Posts = "Yes"; 
const user_Preference_Submissions = "Yes"; 
const user_Preference_Submission_Comments = "No"; 
const user_Preference_Comments_On_My_Submissions = "Yes"; 
const user_Preference_Announcements = "Yes"; 
const user_Preference_Announcement_Comments = "No"; 
const user_Preference_Comments_On_My_Announcements = "Yes"; 
const user_Preference_Announcement_Mentions = "No"; 
const user_Preference_Announcement_Comment_Mentions = "Yes"; 
const user_Preference_Post_Mentions = "No"; 
const user_Preference_Post_Comment_Mentions = "Yes"; 
const user_Preference_Submission_Mentions = "No"; 
const user_Preference_Submission_Comment_Mentions = "Yes"; 
let userIdForSDK = parseInt("78", 10); 
let adminType = "No".toLowerCase() === "yes" ? "Yes" : "No"; 
let teacherType = "No".toLowerCase() === "yes" ? "Yes" : "No"; 
let userTypeForSDK = ""; if (adminType === "Yes") { userTypeForSDK = "Admin"; } else if (teacherType === "Yes") { userTypeForSDK = "Teacher"; } else { userTypeForSDK = "Student"; } console.log({ userIdForSDK, adminType, teacherType, userTypeForSDK });
</script>
