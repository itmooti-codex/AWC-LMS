//*****************************************************//
INITIALISING THE PLUGIN. (getting the plugin through CDN);
//*****************************************************//
<script async data-chunk="client" src="https://static-au03.vitalstats.app/static/sdk/v1/latest.js" crossorigin="anonymous" />



//*****************************************************//
INITIALISING THE PLUGIN. (Will store plugin 
data in global variable called tempPlugin.);
To enable dev mode by default, i am passing isDefault
To Boolean True in object of options.
//*****************************************************//

let tempplugin;
async function anyfn() {
  tempplugin = await window.initVitalStatsSDK({
    slug: 'eventmx',
    apiKey: 'lZirodvxO8LO6cD1QnA7C',
    isDefault: true
  }).toPromise();

  console.log('VitalStats SDK initialized:', tempplugin);
}


anyfn()


//*******************************************************************//
FETCHING THE RECORDS (fetch one record from contacts)
//*******************************************************************//

async function fetchRecord() {
    const data = await localRec
        .query()
        .where('email', 'princeprince1052@gmail.com')
        .fetchOneRecord()
        .toPromise();

    if (data) return data;
    else throw new Error('No record found');
}


//*****************************************************//
GET THE NAME OF REQUIRED MODEL OF 
ANY SCHEMA.
//*****************************************************//


tempplugin.getState().DataSource.schema.name

Or


tempplugin.plugin.getState().EventmxContact.schema.name //CONTACT MODEL NAME





//*****************************************************//
FETCHING SOME REQUIRED DOCS ENTIRELY
 WITH DOCUMENT INSTANCES OR METHODS.
//*****************************************************//







async function testContactQuery() {
  const contacts = tempplugin.plugin.switchTo('EventmxContact');
  const result = await contacts.query().where('email', 'princeprince1052@gmail.com').fetchOneRecord().toPromise();
  console.table('Query result:', result);
      console.log('Query result:', result);
      console.dir('Query result:', result);


}

testContactQuery();



//*****************************************************//

CREATING NEW DOC AND FETCHING IT.
//*****************************************************//


async function createContact() {
 const contactModel = tempplugin.plugin.switchTo('EventmxContact');
 // 2. Start a mutation and switch to the contact model's schema name
 const mutation = tempplugin.plugin.mutation().switchTo(contactModel.schema.name);
 // 3. Add the new contact data (adjust fields as needed)
 mutation.createOne({
   first_name: 'Console',
   last_name: 'User',
   email: 'consoleuser@example.com'
   // add other fields if required
 });
 // 4. Execute the mutation
 await mutation.execute(true).toPromise();
 console.log('Contact created!');
}


createContact();




async function fetchContact() {
 const contactModel = tempplugin.plugin.switchTo('EventmxContact');
 const result = await contactModel.query().where('email', 'consoleuser@example.com').fetchOneRecord().toPromise();
 console.log(result);
}
fetchContact();



//Here we are creating the contact and using the created contact’s gmail to fetch the user.


//*****************************************************//
FETCHING ALL CONTACTS:	
//*****************************************************//

async function fetchAllContacts() {
  // 1. Switch to the contact model (replace 'EventmxContact' with your actual model name if different)
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  // 2. Fetch all contacts
  const allContacts = await contactModel.query().fetchAll().toPromise();
  console.log('All contacts:', allContacts);
  // Optionally, inspect the first contact
  if (allContacts && allContacts.length > 0) {
    console.log('First contact:', allContacts[0]);
  }
}

fetchAllContacts();




//*****************************************************//
FETCH ONLY 5 CONTACTS (using limit)
//*****************************************************//

async function fetchFiveContacts() {
 const contactModel = tempplugin.plugin.switchTo('EventmxContact');
 const fiveContacts = await contactModel.query().limit(5).fetchAll().toPromise();
 console.log('First 5 contacts:', fiveContacts);
}
fetchFiveContacts();




//***********************************************************//
CREATE AND FETCH (For creation, we chain dot 
mutation method to the model or to the plugin instance.
 Our wish.)
//*****************************************************//



async function createContactAndReturnFields() {
 const contactModel = tempplugin.plugin.switchTo('EventmxContact');
 const mutation = tempplugin.plugin.mutation().switchTo(contactModel.schema.name);


 // Create the new contact
 mutation.createOne({
   first_name: 'John',
   last_name: 'Doe',
   displayname: 'John Doe',
   email: 'john.doe.unique@example.com'
 });


 await mutation.execute(true).toPromise();


 // Fetch the newly created contact by unique field (email)
 const result = await contactModel
   .query()
   .where('email', 'john.doe.unique@example.com')
   .fetchOneRecord()
   .toPromise();


 // Manually pick only the fields you want
 const state = typeof result.getState === 'function' ? result.getState() : result;
 const selectedFields = {
   first_name: state.first_name,
   last_name: state.last_name,
   displayname: state.displayname
 };


 console.log('Created contact (selected fields):', selectedFields);
}


createContactAndReturnFields();




//*****************************************************************/
CODE FOR SUBSCRIPTION (subscription however have 
not been tested). 
But this is how we will avail it.
//*****************************************************************/

const contactModel = tempplugin.plugin.switchTo('EventmxContact');
const query = contactModel.query().limit(5);

// Subscribe to the query result
const unsubscribe = query.subscribe(records => {
  console.log('Contacts changed:', records);
});

// Later, to stop listening:
// unsubscribe();



//*****************************************************************/
CODE FOR UPDATING THE CONTACTS TO AVAIL
 SUBSCRIPTION.
//*****************************************************************/

async function updateContact() {
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  const record = await contactModel.query().where('email', changing).fetchOneRecord().toPromise();
  await record.setState({ first_name: 'Andy' }).toPromise(); 
}
updateContact();
//changing the document by getting the document first.
//we will fetch entire document, which will fetch document instances too, so we will basically change the object’s values and run toPromise() to save it in the db.


//*****************************************************************/
CODE FOR UPDATING CONTACTS.
//*****************************************************************/

async function updateContact() {
 const contactModel = tempplugin.plugin.switchTo('EventmxContact');
 const record = await contactModel.query().where('email', 'andrew@itmooti.com').fetchOneRecord().toPromise();
 await record.setState({ first_name: 'Andy' }).toPromise();
}
updateContact();


//*****************************************************************/
INITIALISING THE PLUGIN. . . (WE WILL BASICALLY STORE PLUGIN DATA IN GLOBAL VAR).
//*****************************************************************/
let tempplugin;
async function anyfn() {
  tempplugin = await window.initVitalStatsSDK({
    slug: 'eventmx',
    apiKey: 'lZirodvxO8LO6cD1QnA7C',
    isDefault: true
  }).toPromise();

  console.log('VitalStats SDK initialized:', tempplugin);
}


anyfn()



/*******************************************************/
FETCHING ONE RECORD WITH EMAIL: andrew+test@itmooti.com
/*******************************************************************/

//We need to call record.getState(); fn on the fetch record, to get all the data.
//getState() would give us plain object of the document.

CODE:
async function fetchRecord() {
  // Replace 'EventmxContact' with your actual model name if different
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  const record = await contactModel
    .query()
    .where('email', 'andrew+test@itmooti.com')
    .fetchOneRecord()
    .toPromise();

  if (record) {
    console.log('Record found:', record);
    // If you want the plain object:
    const state = typeof record.getState === 'function' ? record.getState() : record;
    console.log('Plain object:', state);
    return state;
  } else {
    console.log('No record found');
    return null;
  }
}

fetchRecord();






/*******************************************************/
INCLUDING FEEDS IN A CONTACT RECORD
WHILE FETCHING A CONTACT. (While fetching a
 contact, we will also fetch the contact’s feeds.) , user
 is andrew+test@itmooti.com
/*******************************************************/

async function fetchContactWithFeeds() {
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  const person = await contactModel
    .query()
    .where('email', 'andrew+test@itmooti.com')
    .include('Feeds', q => q) // fetch all related Feeds (events)
    .fetchOneRecord()
    .toPromise();

  const state = typeof person.getState === 'function' ? person.getState() : person;
  console.log('Person:', {
    first_name: state.first_name,
    last_name: state.last_name,
    email: state.email,
    Feeds: state.Feeds // array of related Feeds (events)
  });
  // To see the feeds/events:
  console.log('Feeds (events):', state.Feeds);
}

fetchContactWithFeeds();



/*******************************************************/
OBTAIN RELATED MODELS WITH CONTACTS
THIS WAY.
/*******************************************************/
const contactModel = tempplugin.plugin.switchTo('EventmxContact')
// grab its schema
const contactSchema = contactModel.schema
// list the virtual (related) fields
const relatedFields = Object.keys(contactSchema.virtualFields)
console.log(relatedFields)

It logs:
0: "Owner"
1: "Feeds"
2: "Notifications"
3: "TagsData"
4: "Reacted_to_Feeds_Data"
5: "Mentioned_in_Feeds_Data"
6: "Bookmarked_Feeds_Data"
7: "Reacted_to_Feeds"
8: "Bookmarked_Feeds"
9: "Mentioned_in_Feeds"





/*******************************************************/
POPULATE OWNER AND FEEDS  AND SELECT WHAT
FIELDS  WE WOULD NEED  IN NEWLY 
FETCHED CONTACT OF A PERSON. (so basically
 populating owner and feeds of fetched contacts.)
/*******************************************************/
// fetch a single Contact plus its Owner and Feeds
const contactWithRelations = await contactModel
  .query()
  .where('email', 'andrew+test@itmooti.com')
  .include(
    'Owner',
    q => q.select([ 'id', 'first_name', 'last_name' ])
  )
  .include(
    'Feeds',
    q => q
      .select([ 'id', 'message', 'created_at' ])
      .where('is_read', false)
  )
  .fetchOneRecord()
  .toPromise()

console.log(contactWithRelations.Owner)  // { id: '…', first_name: 'Andrew', last_name: 'Test', … }
console.log(contactWithRelations.Feeds)  // [ { id: '…', message: '…', created_at: 162… }, … ]







/*******************************************************/
LOG THE RELATED MODELS (done again)
/*******************************************************/
const contactSchema = tempplugin.plugin.getState().EventmxContact.schema;
console.log(Object.keys(contactSchema.fields)); //SHOWS ALL FIELDS OF CONTACT
console.log(Object.keys(contactSchema.virtualFields)); //SHOWS ALL RELATED MODELS  OF CONTACT



/*******************************************************/
FIND MODEL NAME OF THE RELATED MODELS
 TO CONTACT (doing again)
/*******************************************************/
const feedsVF = tempplugin.plugin
  .switchTo('EventmxContact')
  .schema.virtualFields.Feeds;

console.log(feedsVF.modelName); 






/*******************************************************/
–WORKS– FETCH THE POSTS MADE BY ANDREW
 (BUG: SELECT DOES NOT WORK)
Email used: andrew+test@itmooti.com
//For select to work, we need to chain deselectall
 method first to the query.


/*******************************************************/

async function fetchContactAndFeeds() {
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');

  const record = await contactModel
    .query()
    .where('email', 'andrew+test@itmooti.com')
    .include('Feeds', feedQ =>
      feedQ.select(['id', 'title', 'created_at']) // ← use real field names from step 2
    )
    .fetchOneRecord()
    .toPromise();

  if (record) {
    console.log('Contact:', record);
    console.log('Feeds:', record.Feeds); // ← this will be an array
    return record;
  } else {
    console.log('No contact found.');
    return null;
  }
}

fetchContactAndFeeds();









/*******************************************************/
–WORKS– FETCH THE POSTS MADE BY ANDREW
 (FIX: ONLY SELECTED VIRTUAL FIELDS). USED 
DISSELECTALL METHOD.
Email : andrew+test@itmooti.com
/*******************************************************/
async function fetchContactAndFeeds() {
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');

  const record = await contactModel
    .query()
    .where('email', 'andrew+test@itmooti.com')
    .include('Feeds', feedQ =>
      feedQ
        .deSelectAll()
        .select(['id', 'title', 'created_at'])
    )
    .fetchOneRecord()
    .toPromise();

  if (record) {
    const feeds = record.Feeds;
    console.log('Contact ID:', record.id);
    console.log('Feeds (only id, title, created_at):');

    for (const key in feeds) {
      const f = feeds[key];
      console.log({
        id: f.id,
        title: f.title,
        created_at: f.created_at,
      });
    }

    return record;
  } else {
    console.log('No contact found.');
    return null;
  }
}

fetchContactAndFeeds();






/*******************************************************/
SEE THE ANDREW’S POSTS, AND WHO ARE 
INVOLVED IN LIKING FOR HIS  POSTS. 
Email: andrew+test@itmooti.com
/*******************************************************/

async function fetchPostsAndReactions() {
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');

  const record = await contactModel
    .query()
    .where('email', 'andrew+test@itmooti.com')
    .include('Feeds', feedQ =>
      feedQ
        .deSelectAll()
        .select(['id', 'title', 'created_at'])
        .include('Feed_Reactors', reactorQ =>
          reactorQ
            .deSelectAll()
            .select(['email', 'display_name'])
        )
    )
    .fetchOneRecord()
    .toPromise();

  if (!record) {
    console.log('No contact found');
    return;
  }

  const feeds = Object.values(record.Feeds || {});

  console.log(`User authored ${feeds.length} feeds:`);

  feeds.forEach(feed => {
    console.log(`\nFeed ID: ${feed.id}, Title: ${feed.title}`);

    const reactors = Object.values(feed.Feed_Reactors || {});
    if (reactors.length === 0) {
      console.log('  No reactions yet.');
    } else {
      console.log('  Reacted by:');
      reactors.forEach(user => {
        console.log(`    - ${user.display_name} (${user.email})`);
      });
    }
  });
}

fetchPostsAndReactions();




/*******************************************************/
FETCH USER AND DELETE HIM/HER + UNDO
 THE DELETE (TIME TRAVEL –DELETE–).

–note– even then i made the model global,
 undo did not work for some reason. DELETION works.
 FETCHING works. UNDO not working.

–Get a bit downwards and you’ll see code for updating
 the post feed data, and there time travel worked fine.
/*******************************************************/

1- make the model global



const contactModel = tempplugin.plugin.switchTo('EventmxContact');

 const mutation = tempplugin.plugin
    .mutation()
    .undoable()
    .switchTo(contactModel.schema.name);



2-fetch  a guy

async function fetchPerson(email) {
  const record = await contactModel
    .query()
    .where('email', email)
    .fetchOneRecord()
    .toPromise();

  if (!record) {
    console.log('❌ No person found with email:', email);
    return null;
  }

  const { email: e, displayname, first_name } = record.getState();
  console.log('✅ Person fetched:', { email: e, displayname, first_name });
  return record;
}




3-DELETE THE PERSON USING HIS/HER EMAIL.

async function deletePerson(email) {
  const record = await fetchPerson(email);
  if (!record) return;

  const { email: e, displayname, first_name } = record.getState();

//  const mutation = tempplugin.plugin
    .mutation()
    .undoable()
    .switchTo(contactModel.schema.name);

  mutation.delete(record);
  await mutation.execute(true).toPromise();

  console.log('🗑️ Deleted person:', { email: e, displayname, first_name });
}



4-again fetch a guy

You’ll not get any record of the person


5-undo the delete

async function undoLastDelete() {
  await mutation.timeTravel(-1);

// I EVEN TRIED TO USE TEMPPLUGIN.PLUGIN.TIMETRAVEL(-1), NONE OF THEM WORKED.
  console.log('↩️ Undo successful – last deletion has been reverted.');
}



6-Now fetch the guy again.



/*******************************************************/
COUNT THE TOTAL NUMBER OF CONTACTS
 AVAILABLE (SUM, AVG, MIN, MAX, MEDIAN TOO
 AVAILABLE).
/*******************************************************/
async function countTotalContacts() {
  const result = await contactModel
    .query()
    .count('*', 'totalContacts') // aggregate function with alias
    .fetch() // executes the calc query
    .toPromise();

  const total = result?.resp?.[0]?.totalContacts;
  console.log('👥 Total contacts:', total);
  return total;
}

countTotalContacts();




/*******************************************************/
USING PIPE TO GET THE LATEST DATA FROM
 DB AND NOT LOCALLY STORED STALE ONE.
/*******************************************************/
async function fetchAllContactsWithPipe() {
  // Assume tempplugin is already initialized and available globally
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');

  // Create the query
  const query = contactModel.query();

  // Fetch all records, pipe through toMainInstance, and await the result
  const contacts = await query
    .fetchAllRecords() // returns an Observable
    .pipe(window.toMainInstance(true)) // ensures you get the main/canonical records
    .toPromise(); // convert Observable to Promise for async/await

  console.log('Fetched contacts (main instances):', contacts);
}

fetchAllContactsWithPipe();





/*******************************************************/
USING ISCANCELLING PROPERTY OF REJECTED
 PROMISE FOR ROBUST ERROR HANDLING.
/*******************************************************/
async function fetchAllContactsWithStatus() {
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  const query = contactModel.query();

  try {
    // Fetch all records as an Observable, pipe to main instance, and await the result
    const fetchObservable = query
      .fetchAllRecords()
      .pipe(window.toMainInstance(true));

    // Await the result as a Promise
    const records = await fetchObservable.toPromise();

    // Check for isCancelling on the query or result (SDK-specific)
    // Usually, isCancelling is a property of a mutation, but if your SDK attaches it to the query/result, check here:
    if (records && records.isCancelling) {
      console.log('❌ Fetch was cancelled or failed.');
    } else {
      console.log('✅ Fetched contacts (main instances):', records);
    }
  } catch (err) {
    // If the fetch throws, log the error
    console.log('❌ Fetch failed with error:', err);
  }
}

fetchAllContactsWithStatus();



/*******************************************************/
USING NODESTROY METHODS ON QUERIES. GENERALLY QUERY OBJECTS ARE DESTROYED AFTER EXECUTION OR RETURNING MEANINGFUL DATA. IT CAN BE MADE INDESTRUCTIBLE AND REUSED TIMES AND AGAIN. WE NEED TO CALL DESTROY METHOD WHEN WE’RE DONE AT SOME POINT.
/*******************************************************/
const query = contactModel.query().where('city', 'Sydney').noDestroy();

const firstFetch = await query.fetchAllRecords().pipe(window.toMainInstance(true)).toPromise();
console.log('First fetch:', firstFetch);

// Later, fetch again with the same query instance
const secondFetch = await query.fetchAllRecords().pipe(window.toMainInstance(true)).toPromise();
console.log('Second fetch:', secondFetch);

// When done, clean up:
query.destroy();



/*******************************************************/
SEARCHING FOR THE POSTS CONTAINING  –ANDREW–
ANYWHERE IN USER DETAILS TO POST COPIES.
/*******************************************************/
const feeds = await feedModel
  .query()
  .where('feed_copy', 'like', '%andrew%')
  .select(['id', 'feed_copy', 'user_id']) // select feed fields
  .include('user', q => q.select(['id', 'display_name', 'email'])) // join user data
  .fetchAll()
  .toPromise();

console.log('Feeds with user info:', feeds);


/*******************************************************/
WE CAN MUTATE DATA IN 2 EQUIVALENT WAYS.
EITHER WE MUTATE PLUGIN OR MUTATE THE MODEL.
/*******************************************************/
plugin.mutation().switchTo('AwcContact'); // from plugin mutation, then switch to model 
plugin.switchTo('AwcContact').mutation(); // from model, get its mutation



/*******************************************************/
UPDATING MULTIPLE RECORDS –UPDATING
ALL THE POST COPIES CONTAINING ANDREW–
/*******************************************************/
async function updateAllAndrewPosts() {
  // 1. Switch to the Feed/Post model (replace with your actual model name if needed)
  const postModel = tempplugin.plugin.switchTo('EventmxFeed'); // or 'EventmxPost', etc.

  // 2. Create a mutation instance (undoable if you want to be able to undo)
  const mutation = tempplugin.plugin
    .mutation()
    .undoable()
    .switchTo(postModel.schema.name);

  // 3. Queue up the update for all posts containing "andrew" in post_copy
  mutation.update(
    query => query.where('post_copy', 'like', '%andrew%'),
    { post_copy: 'POSTS CONTAINING ANDREW HAVE BEEN UPDATED' }
  );

  // 4. Execute the mutation
  const result = await mutation.execute(true).toPromise();

  if (result.isCancelling) {
    console.log('❌ Update failed or was cancelled.');
  } else {
    console.log('✅ All matching posts updated!');
  }
}

updateAllAndrewPosts();



/*******************************************************/
WORKING WITH SESSIONS. THESE ARE PERSISTENT
ACROSS PAGE LOADS. STORE USER PREFERENCES
OR OTHER FLAGS.
/*******************************************************/
Init:
const session = tempplugin.plugin.getSession();



/*******************************************************/
FETCHING ALL THE POSTS CONTAINING POST COPY –ANDREW–
AND UPDATTING ALL OF THEM. (works)
/*******************************************************/

**FETCH ONE ANDREW POST
async function fetchOneAndrewPost() {
  const postModel = tempplugin.plugin.switchTo('EventmxFeed'); // or your actual feed/post model name
  const post = await postModel
    .query()
    .where('feed_copy', 'like', '%andrew%')
    .fetchOneRecord()
    .toPromise();

  if (post) {
    const state = typeof post.getState === 'function' ? post.getState() : post;
    console.log('Fetched post:', state);
    return post;
  } else {
    console.log('No post found with "andrew" in feed_copy.');
    return null;
  }
}



**UPDATE ONE ANDREW POST

async function updateAndrewPost() {
  const post = await fetchOneAndrewPost();
  if (!post) return;

  const postModel = tempplugin.plugin.switchTo('EventmxFeed');
  const mutation = tempplugin.plugin
    .mutation()
    .undoable()
    .switchTo(postModel.schema.name);

  mutation.update(post, { feed_copy: 'POSTS CONTAINING ANDREW HAVE BEEN UPDATED' });
  await mutation.execute(true).toPromise();

  console.log('✅ Post updated (undoable).');
}


**UNDO THE LAST UPDATE

async function undoLastUpdate() {
  await tempplugin.plugin.timeTravel(-1);
  console.log('↩️ Undo successful – last update has been reverted.');
}



/*******************************************************/
SESSIONS IN PLUGIN.
/*******************************************************/

What is the props field?
The session record has a special field called props.
props is a JSON object where you can store any arbitrary data you want (like user preferences, temporary flags, etc.).
Data saved in props will be available the next time the user visits (persistent across page loads).


Getting the session record.
const session = getVitalStatsPlugin().getSession();  // or even chain getState() here for getting required values.


Mutating the session record.

getVitalStatsPlugin().getSession().setProps({
  Name: ‘Kushal Mishra’,
  theme: 'dark',
  lastVisited: Date.now()
});


Getting the Props record.

const props = session.getState().props;
console.log('Theme:', props.theme);
console.log('Last visited:', props.lastVisited);

//These values were persistent across page loads. These data aren’t that easily deleted.

//N O  T E: 
For instance, if we run: 
window.initVitalStatsSDK({ slug: 'eventmx', ... });
window.initVitalStatsSDK({ slug: 'awc', ... });

The SDK will create one session record for 'eventmx' and one session record for 'awc' for the same user/browser.
Data you store in the session for 'eventmx' will not be visible in the session for 'awc', and vice versa.








/*******************************************************/
WHAT IS:   isDefault: true [ENABLING THE DEV MODE].
/*******************************************************/
–If we initialize the SDK as or specifically use isDefault=true in options, then: 

window.initVitalStatsSDK({
  slug: 'eventmx',
  apiKey: '<apikeyhere>',
  isDefault: true  //MOST
});


–Run enable dev mode function in the console.
   enableDevMode();

–Run Get App Data; function in console.
   getAppData();



/*******************************************************/
GET METHOD FOR GETTING DATA.
GET FROM LOCAL STATE ONLY. (works)
/*******************************************************/
Method: .getOneRecord() or .getAllRecords()
When to use: When you need to access data you know has already been loaded, and you want an instant, synchronous response without any network requests.

EG:

function getLocalContactById(id) {
  console.log(`--- 1. GETTING (local only) contact with ID: ${id} ---`);
  // Make sure tempplugin is initialized
  if (!tempplugin) return console.log('❌ SDK not initialized.');

  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  const query = contactModel.query().where('id', id);

  // Synchronous call - no await needed.
  const localRecord = query.getOneRecord();

  if (localRecord) {
    console.log('✅ Found record in LOCAL CACHE:', localRecord.getState());
  } else {
    console.log('ℹ️ Record not found in local cache. You may need to fetch it first.');
  }
}






/*******************************************************/
FIND METHOD FOR GETTING DATA:
Find Locally, or Fetch from Server If unavailable 
locally.(works)
/*******************************************************/
Method: .find()
When to use: When you need a record and don't care if it comes from the cache or the server. This is efficient as it avoids a network call if the data is already local.

get, find, and fetch all return what's called a payload Object.
When .find() resolves from the local cache, it returns a payload object where payload.records contains the results.

async function findContactById(id) {
  console.log(`--- 2. FINDING (local, then server) contact with ID: ${id} ---`);
  if (!tempplugin) return console.log('❌ SDK not initialized.');

  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  const query = contactModel.query().where('id', id);

  const payload = await query.find().pipe(window.toMainInstance(true)).toPromise();

  // The payload itself is an object of records, keyed by ID.
  // We check if the payload exists and if our ID is a key in it.
  if (payload && payload[id]) {
    const record = payload[id];
    console.log('✅ Found record (from cache or server):', record.getState());
  } else {
    console.log(`ℹ️ Record with ID ${id} not found anywhere.`);
  }
}

//run above function now to search locally.
findContactById(111); //could be any contact ID.








/*******************************************************/
FETCH DIRECT METHOD FOR GETTING DATA.
FETCH RELATED DATA DIRECTLY FROM THE 
SERVER, NO MATTER WHAT.
/*******************************************************/
Method: .fetchDirect()
When to use: When you need raw, plain data for a one-off task (like a report or chart) and you explicitly do not want to affect the local cache.

async function fetchDirectContactById(id) {
  console.log(`--- 4. FETCHING DIRECT (server only, no cache) contact with ID: ${id} ---`);
  if (!tempplugin) return console.log('❌ SDK not initialized.');

  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  const query = contactModel.query().where('id', id);

  // This goes to the server and returns raw data, bypassing the local state.
  // You MUST select the fields you want.
  const payload = await query
    .select(['id', 'email', 'first_name', 'last_name'])
    .fetchDirect()
    .toPromise();

  if (payload && payload.resp && payload.resp.length > 0) {
    console.log('✅ Fetched raw data directly from server:', payload.resp[0]);
  } else {
    console.log('ℹ️ Record not found on the server.');
  }
}













/*******************************************************/
LOCAL SUBSCRIBE METHOD FOR SUBSCRIPTION:
(WORKS)
ANY QUERY FAMILY THAT INVOLVES ‘GET’
WON’T PERFORM ANY DB OPERATIONS TO
FETCH DATA FROM SERVER.
THE QUERY BELOW WILL MANAGE SUBSCRIPTION
FOR LOCALLY AVAILABLE DATA.
/*******************************************************/
What it does:
Subscribes to changes in local records only.
Does not create a server subscription, but will emit if you change local records that match the query.
When to use:
When you want to react to local changes (e.g., UI updates) but don’t need real-time server sync.

Eg:

function subscribeToLocalContact(id) {
  // Make sure tempplugin is initialized
  if (!tempplugin) {
    console.log('Initialize SDK first');
    return;
  }
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');

  // 1. First, get the local record instance by its ID
  const record = contactModel.query().where('id', id).getOneRecord();

  if (!record) {
    console.log(`ℹ️ Cannot subscribe. Record with ID ${id} not found in local cache.`);
    return;
  }

  // 2. Subscribe directly to the record instance
  const subscription = record.subscribe(updatedRecord => {
    // The callback receives the updated record instance
    console.log(`--- Record with ID ${id} was updated! ---`);
    console.log('New state:', updatedRecord.getState());
    console.log('------------------------------------');
  });

  // 3. Keep a reference to the unsubscribe function
  // We'll store it in a global object to manage multiple subscriptions
  if (!window.recordSubscriptions) {
    window.recordSubscriptions = {};
  }
  window.recordSubscriptions[id] = subscription;

  console.log(`✅ Subscribed to local changes for contact with ID: ${id}`);
}

// How to use:
// 1. Make sure the record is in your local cache (e.g., by fetching it first).
// 2. Run this to start listening to a specific user.
subscribeToLocalContact(111); // Subscribes to Andrew Wadsworth
subscribeToLocalContact(103); // Subscribes to tenzin admin

// 3. Later, when you want to stop listening to a specific user:
if (window.recordSubscriptions && window.recordSubscriptions[111]) {
  window.recordSubscriptions[111].unsubscribe();
  console.log(`✅ Unsubscribed from local changes for contact 111.`);
}




/*******************************************************/
CRUD Operations: Local vs. Database Interaction
/*******************************************************/

Operation
Method(s)
Local State?
Database?
Description
READ
get() <br> (.getOneRecord(), .getAllRecords())
✅ Yes (Only)
❌ No
Local Only. Synchronously reads from the local cache. Fastest, but requires data to be pre-loaded.
READ
find()
✅ Yes
✅ Yes
Both. Checks local cache first. If data is not present or deemed incomplete, it fetches from the database.
READ
fetch() <br> (.fetchOneRecord(), .fetchAllRecords())
✅ Yes
✅ Yes
Both. Always fetches the latest data from the database and then updates the local cache with the results.
READ
fetchDirect()
❌ No
✅ Yes (Only)
Database Only. Fetches raw, plain data directly from the database and does not update the local cache.
CREATE
mutation.createOne() <br> mutation.create() <br> (followed by .execute())
✅ Yes
✅ Yes
Both. Optimistically creates the record(s) in the local state instantly, then sends the create request to the database.
UPDATE
mutation.update() <br> record.setState() <br> (followed by .execute() for mutation)
✅ Yes
✅ Yes
Both. Optimistically updates the record(s) in the local state instantly, then sends the update request to the database.
DELETE
mutation.delete() <br> (followed by .execute())
✅ Yes
✅ Yes
Both. Optimistically removes the record(s) from the local state instantly, then sends the delete request to the database



/*******************************************************/
PASSING VARIABLES INSIDE QUERIES..
/*******************************************************/
WE CONSTRUCT LAZY QUERY AND LATER RUN THE QUERY PASSING 
QUERY VARIABLES AND CHAINING FETCH WITH QUERY ALONG WITH 
PAYLOAD OBJECT.

async function findContactByEmail(emailAddress) {
  // Make sure your plugin is ready
  if (!tempplugin) return console.log('SDK not initialized');
  const contactModel = tempplugin.plugin.switchTo('EventmxContact');
  
  // 1. Create a query with a placeholder for the email
  const query = contactModel.query().where('email', ':email');

  // 2. Execute the query and provide the real email in the 'variables' object
  const result = await query.fetch({
    variables: {
      email: emailAddress 
    }
  });

  console.log(`Searching for email: ${emailAddress}`);
  if (result && result.records) {
    console.log('✅ Found record:', result.records);
  } else {
    console.log('ℹ️ No record found.');
  }
}

// --- How to use it ---

// Run the function with the email you want to find
findContactByEmail('andrew+test@itmooti.com');

// You can reuse the same function to find a different person
findContactByEmail('tenzin+admin@itmooti.com');




/*******************************************************/

/*******************************************************/


/*******************************************************/
/*******************************************************/

