# Refer to the scaffolded project structure in README.md for folder and file organization.

1) SDK initialize
2) Model switch
3) Method: Select/Fetch/Mutation/Condtioning



Notification
Forum
Course Content



We initilaize the sdk first

Then we need to be able to switch models like Notifications or Forums

then we need to be able to operate on those models with different methods

You will create a project structure to match this


example fetch query

subscription subscribeToAlerts(
  $limit: IntScalar
  $offset: IntScalar
) {
  subscribeToAlerts(
    limit: $limit
    offset: $offset
    orderBy: [{ path: ["created_at"], type: desc }]
  ) {
    ID: id
    Title: title
    Content: content
    Is_Read: is_read
    Unique_ID: unique_id
    Alert_Type: alert_type
    Date_Added: created_at
    Origin_URL: origin_url
    Is_Mentioned: is_mentioned
    Parent_Post_ID: parent_post_id
    Parent_Class_ID: parent_class_id
    Date_Modified: last_modified_at
    Parent_Comment_ID: parent_comment_id
    Notified_Contact_ID: notified_contact_id
    Parent_Submission_ID: parent_submission_id
    externalRawDataStatus
    Parent_Announcement_ID: parent_announcement_id
  }
}



example response
{
  "data": {
    "subscribeToAlerts": [
      {
        "Alert_Type": "Post",
        "Content": "This is test contact",
        "Date_Added": 1753180994,
        "Date_Modified": 1753181027,
        "ID": 1,
        "Is_Mentioned": false,
        "Is_Read": false,
        "Notified_Contact_ID": 62,
        "Origin_URL": "Https://google.com",
        "Parent_Announcement_ID": null,
        "Parent_Class_ID": 2,
        "Parent_Comment_ID": null,
        "Parent_Post_ID": 1420,
        "Parent_Submission_ID": null,
        "Title": "This is test title",
        "Unique_ID": "8VT87R9",
        "externalRawDataStatus": "ok"
      }
    ]
  },
  "extensions": {}
}