1
What do we need?

User sees notifications in two places: Navbar and View all page
User marks notifications read
User clicks on notification to mark it as read and also navigate to the origin 
User toggles between read and unread view of notifications
User toggles between All Notifications and Announcements
User sees few on navbar and all on view all page

What will we do?

Create a new object called Alerts
Add required Fields
Title - Create it when notification is created
Content - Get from parent record
Date - is date added
Notified Contact
Is it mentioned?
Is it Read?
Parent Post
Parent Announcement
Parent Submission
Parent Comment
Class id
URL
Type
Post
Post Mention
Post Comment
Post Comment Mention
Announcement 
Announcement Mention
Announcement Comment
Announcement Comment Mention
Submission
Submission Mention
Submission Comment
Submission Comment Mention
When a post or submission or comment or announcement is created, create notification for each user inside that class.
When they are deleted, delete all notification that it created
Example creation
Post is created
Create notification related to that post
Create many queries. Lets say this post is in class who have two students
Example payload

Post content: Hey! @kushal, how are you?

{
	Title: “A post has been created”,
	Content: {Parent post content}
	Date added: auto
	Notified contact: Example 74
	Is mentioned: false
	Is read: false
	Parent Post: 100
	Parent announcement: null
	Parent Submission: null
	Parent comment: null
	Type: Post
	URL: Example url
}
{
	Title: “You have been mentioned in a contact”,
	Content: {Parent post content}
	Date added: auto
	Notified contact: Example 76 (Kushal)
	Is mentioned: true
	Is read: false
	Parent Post: 100
	Parent announcement: null
	Parent Submission: null
	Parent comment: null
	Type: Post Mention
URL: Example url
}
Example deletion
When parent record is deleted, delete all notification related to that parent record
Delete post with ID 100
Example payload
	Delete_notifications {
		Where: post id = 100
}


Example origin url
`https://courses.writerscentre.com.au/students/course-details/
${courseUid}
?eid=${myEidFromCourse}
&selectedTab=courseChat
&current-post-id=${notification.Notification_Type === 'Posts' ? notification.Post_ID : commentIdForNoti}
&classIdFromUrl=${classIdUrl}
&className=${classNameUrl}
&classUid=${classUniqueId}
&currentClassID=${classIdUrl}
&currentClassName=${classNameUrl}
&currentClassUniqueID=${classUniqueId}

https://courses.writerscentre.com.au/course-details/content/
${lessonUid}
?eid=${myEidFromLesson}
&classIdFromUrl=${classIdUrl}
&className=${classNameUrl}
&classUid=${classUniqueId}
&currentClassID=${classIdUrl}
&currentClassName=${classNameUrl}
&currentClassUniqueID=${classUniqueId}
&submissionPostIs=${notification.Notification_Type === 'Submission Comments' ? notification.Submissions_ID : commentIdForNoti}${assessmentType === "File Submission" ? `
&subUID=${subUID}
&commentScrollId=${commentScrollID}` : ""}
&notType=${notification.Notification_Type}

https://courses.writerscentre.com.au/students/course-details/
${courseUid}
?eid=${myEidFromCourse}
&selectedTab=announcemnt
?data-announcement-template-id=${notification.Notification_Type === 'Announcements' ? anouncementScrollId : commentIdForNoti}
&classIdFromUrl=${classIdUrl}
&className=${classNameUrl}
&classUid=${classUniqueId}
&currentClassID=${classIdUrl}
&currentClassName=${classNameUrl}
&currentClassUniqueID=${classUniqueId}
        

How should this work on frontend

First get logged in user id
Use that id to get all the classes that user has enrolled into
Use those classes to fetch the notifications
Use date enrolled and pause notification time stamp to manage unrelated notification
Implement separate logic for nav and body: nav shows only the latest 20 and body shows all. Body will have scrolling pagination
Each notification card acts as a link to origin and also runs mutation to mark read. Cannot undo to unread



Critical: for all three roles

Course chat page
Post
{
	Title: “A post has been created”,
	Content: {Parent post content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: Example id
	Parent announcement: null
	Parent Submission: null
	Parent comment: null
	Type: Post//Post Mention
	URL: Example url
}
Comment
	{
	Title: “A comment has been created”,
	Content: {Parent comment content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: Example parent post id
	Parent announcement: null
	Parent Submission: null
	Parent comment: Example id
	Type: Post Comment//Post Comment Mention
	URL: Example url
}
Reply
		{
	Title: “A reply has been created”,
	Content: {Parent reply content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: Example parent post of parent comment
	Parent announcement: null
	Parent Submission: null
	Parent comment: Example id
	Type: Post Comment//Post Comment Mention
	URL: Example url
}
Announcement page
Announcement //This is for only teachers and admin
		{
	Title: “A announcement has been created”,
	Content: {Parent announcement content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: null
	Parent announcement: Example id
	Parent Submission: null
	Parent comment: null
	Type: Announcement//Announcement Mention
	URL: Example url
}
Comment
		{
	Title: “A announcement comment has been created”,
	Content: {Parent comment content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: null
	Parent announcement: Example id of parent announcement
	Parent Submission: null
	Parent comment: null
	Type: Announcement Comment//Announcement Comment Mention
	URL: Example url
}
Reply
		{
	Title: “A announcement comment has been created”,
	Content: {Parent comment content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: null
	Parent announcement: Example id of parent announcement of parent comment
	Parent Submission: null
	Parent comment: null
	Type: Announcement Comment//Announcement Comment Mention
	URL: Example url
}
Submissions page
Submission //Only for students
		{
	Title: “A submission has been created”,
	Content: {Parent submission content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: null
	Parent announcement: null
	Parent Submission: example id
	Parent comment: null
	Type: submission//submission Mention
	URL: Example url
}
Comment
{
	Title: “A submission comment has been created”,
	Content: {Parent submission content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: null
	Parent announcement: null
	Parent Submission: example id of parent submission
	Parent comment: null
	Type: submission comment//submission comment Mention
	URL: Example url
}
Reply
		{
	Title: “A submission comment has been created”,
	Content: {Parent submission content}
	Date added: auto
	Notified contact: Example id
	Is mentioned: false//true
	Is read: false//true
	Parent Post: null
	Parent announcement: null
	Parent Submission: example id of parent submission of parent comment
	Parent comment: null
	Type: submission comment//submission comment Mention
	URL: Example url
}



To implement (First in edu flow pro account) uses sdk

Create alerts object with all necessary fields
Implement announcement logic in both nav and body 
Implement empty states
Implement mark as read/mark all as read
Implement read unread ui
Implement filter logic to show unread only or all
Implement filter logic to show all notifications or announcement type only
Update preferences to match new settings 
Implement limit on nav for 20 and scrolling pagination on body 
Implement unified class logic to fetch announcements for teacher and admin and student
Implement crud on announcement
create logic when post/submission/announcement or related comment or reply is created
delete logic when related record is deleted
Github deployment
Ec2 deployment 

---

## Project Structure (Scaffold)

```
AWC-LMS/
│
├── src/
│   ├── config/                # Configuration files (API keys, endpoints, etc.)
│   │   └── index.js
│   ├── models/                # Data models (Notification, Forum, Course, etc.)
│   │   └── notification.model.js
│   │   └── forum.model.js
│   │   └── course.model.js
│   ├── services/              # Business logic, CRUD, fetch, and subscription methods
│   │   └── notification.service.js
│   │   └── forum.service.js
│   │   └── course.service.js
│   ├── subscriptions/         # Subscription logic for real-time updates
│   │   └── notification.sub.js
│   │   └── forum.sub.js
│   ├── utils/                 # Utility/helper functions
│   │   └── index.js
│   └── index.js               # Entry point for SDK integration and app logic
│
├── tests/                     # Unit and integration tests
│   └── notification.test.js
│   └── forum.test.js
│
├── public/                    # Static assets (if needed)
│
├── package.json               # Project dependencies and scripts
├── .env                       # Environment variables (not committed)
└── README.md                  # Project documentation
```

- **src/config/**: Centralized configuration (API keys, endpoints, etc.)
- **src/models/**: Data models for Notifications, Forums, Courses, etc.
- **src/services/**: Business logic, CRUD, fetch, and subscription methods for each model
- **src/subscriptions/**: Real-time subscription logic
- **src/utils/**: Utility/helper functions
- **src/index.js**: Main entry point for SDK initialization and app logic
- **tests/**: Test files for each module
- **public/**: Static assets (optional)
- **package.json**: Project dependencies and scripts
- **.env**: Environment variables (not committed)

---



