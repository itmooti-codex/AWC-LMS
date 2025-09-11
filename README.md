We have to update few things

First is fetching alerts
As the notified contact is the base condtion, we would want to add another condtion that will always remain regardless of other alerts fetch condtion and that is alert status

So we only fetch those alerts with status published
here is the query 
query getAlerts {
  getAlerts(
    query: [{ where: { alert_status: "Published" } }]
  )
}


alert status can have two values Published and Not Published.

But we only fetched that are published.

Meaning when we create alerts, now we have to send alert status for each alert created to have published value by default

Except for one case where we create alerts for announcemnts. we need to check createAnnouncment.js

When it is scheduled type of announcement, we dont create alerts at all now. we follow exact same method for creating alerts when creating regualr announcment but for this scheduled ones, we send Not Published as alert status so, alerts do get created but now users wont be notified.

There is a catch. so if alert is scheduled but user clicks on post now before the scheduled time, the announcement is not updated using update query to update the announcement status to Published.

When this happens, we need to keep track of all alerts related to this announcemnt and run update query to those alerts now to update to Published alert status

When clicked on Post Now button for schedueld announement, first we need to identify the alerts of it and we cna do so by
query calcAlerts(
  $parent_announcement_id: AwcAnnouncementID
) {
  calcAlerts(
    query: [
      {
        where: {
          parent_announcement_id: $parent_announcement_id
        }
      }
    ]
  ) {
    ID: field(arg: ["id"])
  }
}


now we have alerts and their id and we take each id and run update mutation on them to make them published with followign
mutation updateAlerts(
  $id: AwcAlertID
  $payload: AlertUpdateInput = null
) {
  updateAlerts(
    query: [{ where: { id: $id } }]
    payload: $payload
  ) {
    alert_status
  }
}


Do all of thise