<!--
URL updates for cards
Each alert will have unique url for each alert type and user roles.
We create alert for each user. So student will have one and teacher and admin also will have different.
This will be totally different for each section like post alert can have one and submission can have another

when admin and when post. This includs for post types, post comment types, post mentions types. basically everything of type post
https://courses.writerscentre.com.au/admin/class/${classIDForADmin}?selectedTab=chats?current-post-id=${notification.Notification_Type === 'Posts' ? notification.Post_ID : commentIdForNoti}
Breaking it down
https://courses.writerscentre.com.au/admin/class/ is the base url
${classIDForADmin} is the class id and this would be the same class we populate into parent class
selectedTab=chats this is always going to be this for all post types
current-post-id=${notification.Notification_Type === 'Posts' ? notification.Post_ID : commentIdForNoti}, here this is checking if
type is post or comment within the post. so if type is post, we can add post id, and if comment, we can add commment id but when comment, we also need to check parent post id and put post id
Note: We already know the alert type, so it should be easier and not complex as it is now


when admin and submission type
https://courses.writerscentre.com.au/course-details/content/${lessonUid}?submissionPostIs=${notification.Notification_Type === 'Submissions' ? notification.Submissions_ID : commentIdForNoti}${assessmentType === "File Submission" ? `&subUID=${subUID}&commentScrollId=${commentScrollID}` : ""}&classIdFromUrl=${classIdUrl}&className=${classNameUrl}&classUid=${classIDForADmin}&currentClassID=${classIdUrl}&currentClassName=${classNameUrl}
Similar to post type.
https://courses.writerscentre.com.au/course-details/content/ this is base url
${lessonUid} this is new and we need to fetch lesson unique id because submission is related to lesson.
I will have lesson id stored in varialbe called lessonUIDFromPage. use that
submissionPostIs=${notification.Notification_Type === 'Submissions' ? notification.Submissions_ID : commentIdForNoti}${assessmentType === "File Submission" ? `&subUID=${subUID}&commentScrollId=${commentScrollID}` : ""}
Now this is checking for if it is submisison comment or submissipon iteslf and popualting comment id and submission id
For assessmentType, i will have variable that has assesment type called assessmentTypeFromPage. use that
classIdFromUrl=${classIdUrl}&className=${classNameUrl}&classUid=${classIDForADmin}&currentClassID=${classIdUrl}&currentClassName=${classNameUrl}
These take id and unique id and class name, which is same as we populate into parent class of alert Id and uid are different, so be careful. ID means id and uid mean unique id




when admin and announcement type
https://courses.writerscentre.com.au/admin/class/${classIDForADmin}?selectedTab=announcements?data-announcement-template-id=${notification.Notification_Type === 'Announcements' ? anouncementScrollId : commentIdForNoti}
 Same as above.

 These all be basically be same for teacher.
 When alerts are created, we first process these url, prepare them and then create alerts.
 -->

 <!-- 
 It is slightly different for students



https://courses.writerscentre.com.au/students/course-details/${courseUid}?eid=${myEidFromCourse}&selectedTab=courseChat&current-post-id=${notification.Notification_Type === 'Posts' ? notification.Post_ID : commentIdForNoti}&classIdFromUrl=${classIdUrl}&className=${classNameUrl}&classUid=${classUniqueId}&currentClassID=${classIdUrl}&currentClassName=${classNameUrl}&currentClassUniqueID=${classUniqueId}

https://courses.writerscentre.com.au/course-details/content/${lessonUid}?eid=${myEidFromLesson}&classIdFromUrl=${classIdUrl}&className=${classNameUrl}&classUid=${classUniqueId}&currentClassID=${classIdUrl}&currentClassName=${classNameUrl}&currentClassUniqueID=${classUniqueId}&submissionPostIs=${notification.Notification_Type === 'Submission Comments' ? notification.Submissions_ID : commentIdForNoti}${assessmentType === "File Submission" ? `&subUID=${subUID}&commentScrollId=${commentScrollID}` : ""}&notType=${notification.Notification_Type}

https://courses.writerscentre.com.au/students/course-details/${courseUid}?eid=${myEidFromCourse}&selectedTab=anouncemnt?data-announcement-template-id=${notification.Notification_Type === 'Announcements' ? anouncementScrollId : commentIdForNoti}&classIdFromUrl=${classIdUrl}&className=${classNameUrl}&classUid=${classUniqueId}&currentClassID=${classIdUrl}&currentClassName=${classNameUrl}&currentClassUniqueID=${classUniqueId}`
here everything is basically same except for eid.
We need eid to be dynamic for each notified contact.
And each notified contact will have many eid but we need to bring that donw to one specific eid that matches this notifgied contact id and class id that htis alert is being created for and we do this in following way
query getEnrolment(
  $id: AwcContactID
  $class_id: AwcClassID
) {
  getEnrolment(
    query: [
      { where: { student_id: $id } }
      { andWhere: { class_id: $class_id } }
    ]
  ) {
    ID: id
  }
}

This effectibvely checks for the eid that we need by checking class id and studfent id and we use this dynamically

-->

<!-- 
This all needs to be done before creating alerts, all data needs to be prepared and then alerts needs to be created.

 -->
