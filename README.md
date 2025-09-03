AWC-LMS Notifications: Fetch Logic And Preferences
=================================================

This document explains how notifications must be fetched based on user preferences. It clarifies mutually exclusive toggles, ownership checks, and what to fetch for posts, submissions, and announcements (including comments and replies).

Where to implement
- Core logic lives in `src/alerts/NotificationCore.js:255` under “Apply user preference conditions…”.
- Preference values are wired in `src/sdk/userConfig.js:10`.

Example preferences (as strings)
```js
const user_Preference_Turn_Off_All_Notifications = "No";

const user_Preference_Posts = "Yes";
const user_Preference_Post_Mentions = "No";
const user_Preference_Post_Comments = "No";
const user_Preference_Comments_On_My_Posts = "Yes";
const user_Preference_Post_Comment_Mentions = "Yes";

const user_Preference_Submissions = "Yes";
const user_Preference_Submission_Mentions = "No";
const user_Preference_Submission_Comments = "Yes";
const user_Preference_Comments_On_My_Submissions = "No";
const user_Preference_Submission_Comment_Mentions = "No";

const user_Preference_Announcements = "Yes";
const user_Preference_Announcement_Mentions = "No";
const user_Preference_Announcement_Comments = "Yes";
const user_Preference_Comments_On_My_Announcements = "No";
const user_Preference_Announcement_Comment_Mentions = "No";
```

Global rule
- If `user_Preference_Turn_Off_All_Notifications` is "Yes", return no notifications at all.

Base entities and mentions
- Posts
  - If `Posts` is Yes: fetch `Post` and `Post Mention`.
  - Else if `Post_Mentions` is Yes: fetch only `Post Mention` where `is_mentioned = true` and `notified_contact_id = loggedInUserId`.
  - `Posts` and `Post_Mentions` are mutually exclusive (UI enforces this).

- Submissions
  - If `Submissions` is Yes: fetch `Submission` and `Submission Mention`.
  - Else if `Submission_Mentions` is Yes: fetch only `Submission Mention` where `is_mentioned = true` and `notified_contact_id = loggedInUserId`.
  - `Submissions` and `Submission_Mentions` are mutually exclusive.

- Announcements
  - If `Announcements` is Yes: fetch `Announcement` and `Announcement  Mention`.
  - Else if `Announcement_Mentions` is Yes: fetch only `Announcement  Mention` where `is_mentioned = true` and `notified_contact_id = loggedInUserId`.
  - `Announcements` and `Announcement_Mentions` are mutually exclusive.

Comments and replies (by entity)
- Posts
  - If `Post_Comments` is Yes:
    - Fetch `Post Comment` and `Post Comment Mention` (all post comment activity).
    - Automatically turn OFF `Comments_On_My_Posts` and `Post_Comment_Mentions` (UI enforces this).
  - Else if `Comments_On_My_Posts` is Yes:
    - Fetch `Post Comment` where the parent post’s `author_id = loggedInUserId`.
    - Can co-exist with `Post_Comment_Mentions`.
  - If `Post_Comment_Mentions` is Yes:
    - Fetch `Post Comment Mention` where `is_mentioned = true` and `notified_contact_id = loggedInUserId`.
    - This turns OFF `Post_Comments` but does NOT affect `Comments_On_My_Posts`.
  - Replies are treated as comments. Additionally:
    - If someone replies inside my post and `Comments_On_My_Posts` is Yes → notify me (post author).
    - If someone replies to my comment anywhere → notify me. There is no separate "Replies on my comments" toggle; the behavior is covered by `Comments_On_My_Posts`.

- Submissions
  - If `Submission_Comments` is Yes: fetch `Submission Comment` and `Submission Comment Mention`.
  - Else if `Comments_On_My_Submissions` is Yes: fetch `Submission Comment` where the submission’s student is me.
  - If `Submission_Comment_Mentions` is Yes: fetch `Submission Comment Mention` where `is_mentioned = true` and `notified_contact_id = loggedInUserId`.
  - Replies mirror the post rules: notify the submission owner and the parent comment’s author.

- Announcements
  - If `Announcement_Comments` is Yes: fetch `Announcement Comment` and `Announcement Comment Mention`.
  - Else if `Comments_On_My_Announcements` is Yes: fetch comments on announcements I created.
  - If `Announcement_Comment_Mentions` is Yes: fetch `Announcement Comment Mention` where `is_mentioned = true` and `notified_contact_id = loggedInUserId`.
  - Replies mirror the post rules: notify the announcement author and the parent comment’s author.

Mutual-exclusion summary (UI behavior expected)
- `Posts` XOR `Post_Mentions`.
- `Submissions` XOR `Submission_Mentions`.
- `Announcements` XOR `Announcement_Mentions`.
- `Post_Comments` cannot be ON with either `Comments_On_My_Posts` or `Post_Comment_Mentions` (the latter two CAN co‑exist).
- Equivalent rules apply to submissions and announcements comment preferences.

Ownership and author checks (query builder examples)
- Comments on my posts
```js
{
  where: {
    Parent_Post: [
      { where: { author_id: $author_id } }
    ]
  }
}
```

- Replies under my post (one level up through comment → post)
```js
{
  where: {
    Parent_Comment: [
      {
        where: {
          Forum_Post: [
            { where: { author_id: $author_id } }
          ]
        }
      }
    ]
  }
}
```

- Replies to my comment
```js
{
  where: {
    Parent_Comment: [
      { where: { author_id: $author_id } }
    ]
  }
}
```

- Submissions: comments on my submission (note the author is the student)
```js
{
  where: {
    Parent_Submission: [
      {
        where: {
          Student: [
            { where: { student_id: $student_id } }
          ]
        }
      }
    ]
  }
}
```

- Submissions: replies to my comment (same author_id rule)
```js
{
  where: {
    Parent_Comment: [
      { where: { author_id: $author_id } }
    ]
  }
}
```

- Announcements: comments on my announcement (author is the instructor)
```js
{
  where: {
    Parent_Announcement: [
      { where: { instructor_id: $instructor_id } }
    ]
  }
}
```

- Announcements: replies under my announcement
```js
{
  where: {
    Parent_Comment: [
      {
        where: {
          Parent_Announcement: [
            { where: { instructor_id: $instructor_id } }
          ]
        }
      }
    ]
  }
}
```

Mention-only filters (all entities)
- When any “...Mentions” preference is Yes and the base is OFF, include only the mention type and filter by:
  - `is_mentioned = true`
  - `notified_contact_id = loggedInUserId`

Important notes
- Comments are stored in a single table used by posts, submissions, and announcements. Relationships determine context.
- Always scope by `notified_contact_id = loggedInUserId` for the current user.
- Avoid fetching unnecessary notifications by honoring the mutual-exclusion and “my ...” filters above.

Implementation tips
- Start from `src/alerts/NotificationCore.js:255` and ensure each branch aligns to the rules here.
- For announcement ownership, helper methods already exist: see
  - `src/alerts/NotificationCore.js:135` `fetchMyAnnouncementIds()` and
  - `src/alerts/NotificationCore.js:173` `fetchMyCommentIds()`.
- Mirror this approach for posts and submissions if you need efficient “my ...” ownership filters.

Outcome
- With these rules, the app fetches only the notifications the user asks for, minimizing noise and avoiding unintended results.
