# Summary

This Markdown contains a bunch of additional info about querying using the SDK, as well as some tips to better use it.

# AwcAlert Query

You can simplify the query you're using to fetch alerts. I'm assuming you built the query with the SDK. 

In SQL, `and` arguments build on the previous argument, and `or` arguments break the chain. 

The SDK works the same way. 

This means it is not necessary to use so many grouped queries.

Correct way:

```javascript
query
  .where() // args group 1
  .andWhere()
  .andWhere()
  .andWhere()
  .orWhere() // args group 2
  .andWhere()
  .andWhere()
  .orWhere() // args group 3
  .andWhere()
  // ...etc
```

So doing this is unnecessary:

```javascript
query
  .where(query => query // args group 1 
     .where()
     .andWhere()
     .andWhere()
     .andWhere()
  )
  .orWhere(query => query // args group 2
    .where()
    .andWhere()
    .andWhere()
  )
  .orWhere(query => query // args group 3
    .where()
    .andWhere()
  )  
```

## Full Example

Let's use your AWC Alert query. 

### Original

I've reconstructed how you would have created it using the SDK, or at least it's close to it. Sometimes the SDK optimizes things by removing unnecessary groupings, so it's impossible to tell 100% from just the GraphQL.

But this should look familiar to your code:

```javascript
awcAlertModel.query()
  .select([
    'id',
    'alert_type',
    'content',
    'created_at',
    'is_mentioned',
    'is_read',
    'notified_contact_id',
    'origin_url',
    'parent_announcement_id',
    'parent_class_id',
    'parent_comment_id',
    'parent_post_id',
    'parent_submission_id',
    'title',
    'unique_id',
  ])
  .include('Parent_Class', q => q
    .select([ 'id', 'class_name' ])
    .includeFields('Course', [ 'course_name' ])
  )
  .where('notified_contact_id', 10435)
  .andWhere(q => q
    .where(q => q
      .where('alert_type', 'Post Mention')
      .andWhere('is_mentioned', true)
    )
    .orWhere(q => q
      .where('alert_type', 'Submission Mention')
      .andWhere('is_mentioned', true)
    )
    .orWhere(q => q
      .where(q => q
        .whereIn('alert_type', [ 'Announcement', 'Announcement Mention' ])
      )
    )
    .orWhere(q => q
      .where('alert_type', 'Post Comment Mention')
      .andWhere('is_mentioned', true)
    )
    .orWhere(q => q
      .where('alert_type', 'Submission Comment Mention')
      .andWhere('is_mentioned', true)
    )
    .orWhere(q => q
      .where('alert_type', 'Announcement Comment Mention')
      .andWhere('is_mentioned', true)
    )
    .orWhere(q => q
      .where('alert_type', 'Post Comment')
      .andWhere(q => q
        .where(q => q 
          .where('Parent_Post', q => q.where('author_id', 10435)))
        )
        .orWhere(q => q
          .where('Parent_Comment', q => q.where('author_id', 10435))
        )
        .orWhere(q => q
          .where('Parent_Comment', q => q
            .where('Forum_Post', q => q
              .where('author_id', 10435)
            )
          )
        )
    )
    .orWhere(q => q
      .where('alert_type', 'Submission Comment')
      .andWhere(q => q
        .where(q => q
          .where('Parent_Submission', q => q
            .where('Student', q => q
              .where('student_id', 10435)
            )
          )
        )
        .orWhere(q => q
          .where('Parent_Comment', q => q.where('author_id', 10435))
        )
      )
    )
    .orWhere(q => q
      .where('alert_type', 'Announcement Comment')
      .andWhere(q => q
        .where(q => q
          .where('Parent_Announcement', q => q
            .where('instructor_id', 10435)
          )
        )
        .orWhere(q => q
          .where('Parent_Comment', q => q
            .where('author_id', 10435)
          )
        )
        .orWhere(q => q
          .where('Parent_Comment', q => q
            .where('Parent_Announcement', q => q.where('instructor_id', 10435))
          )
        )
      )
    )
  )
```

There are a lot of unnecessary groupings in your query. 

Additionally, when you have a bunch of 2-argument groups that all use the same `.andWhere(key, value)`, you can combine those into a `whereIn()`.

In your case, you have a bunch like this:

```javascript
query
  .where('alert_type', 'XYZ')
  .andWhere('is_mentioned', true)
  .orWhere('alert_type', 'XYZ')
  .andWhere('is_mentioned', true)
  // ...etc
```

Therefore, you can combine those into a single `whereIn()` + `andWhere()`:

```javascript
query
  .whereIn('alert_type', [ ...values ])
  .andWhere('is_mentioned', true)
```

### Corrected

Here is the corrected query that gets rid of all the unnecessary argument groups and also combines the duplicate 2-argument groups into a `whereIn()` + `andWhere()` as described above:

```javascript
awcAlertModel.query()
  .select([
    'id',
    'alert_type',
    'content',
    'created_at',
    'is_mentioned',
    'is_read',
    'notified_contact_id',
    'origin_url',
    'parent_announcement_id',
    'parent_class_id',
    'parent_comment_id',
    'parent_post_id',
    'parent_submission_id',
    'title',
    'unique_id',
  ])
  .include('Parent_Class', q => q
    .select([ 'id', 'class_name' ])
    .includeFields('Course', [ 'course_name' ])
  )
  .where('notified_contact_id', 10435)
  .andWhere(q => q
    .whereIn('alert_type', [
      "Post Mention",
      "Submission Mention",
      "Post Comment Mention",
      "Submission Comment Mention",
      "Announcement Comment Mention",
    ])
    .andWhere('is_mentioned', true)
    .orWhereIn('alert_type', [ 'Announcement', 'Announcement Mention' ])
    .orWhere('alert_type', 'Post Comment')
    .andWhere(q => q
      .where('Parent_Post', q => q.where('author_id', 10435))
      .orWhere('Parent_Comment', q => q
        .where('author_id', 10435)
        .orWhere('Forum_Post', q => q.where('author_id', 10435))
      )
    )
    .orWhere('alert_type', 'Submission Comment')
    .andWhere(q => q
      .where('Parent_Submission', q => q
        .where('Student', q => q.where('student_id', 10435))
      )
      .orWhere('Parent_Comment', q => q.where('author_id', 10435))
    )
    .orWhere('alert_type', 'Announcement Comment')
    .andWhere(q => q
      .where('Parent_Announcement', q => q.where('instructor_id', 10435))
      .orWhere('Parent_Comment', q => q
        .where('author_id', 10435)
        .orWhere('Parent_Announcement', q => q.where('instructor_id', 10435))
      )
    )
  )
```

# Tip - Use GraphQL Output

Use `query.toGraphql({})` to see the GraphQL query that would be generated from your Query. This makes it easy to visualize everything. 

Passing an Object to the `toGraphql()` method will "pretty print" the GraphQL. However, if you're doing it on the client, the pretty print module is lazy-loaded (async). Therefore, the first time you call `query.toGraphql({})`, it won't be pretty printed, but it will trigger loading the module from the server. Then, the next time you call it, the output will be pretty printed.

You can provide `prettier` arguments in your Object, but this is probably unnecessary, the defaults output it very nicely.

To print the GraphQL but not "pretty print" it, simply provide `true` to the method: `query.toGraphql(true)`. This is what happens under the hood when you execute the query using the SDK.

# Caching/Local State

There are some sections in the "new" AWC setup you sent me yesterday where the user can cycle between different tabs, but without reloading the page.

For example, Course Overview and Course Content.

While returning to the same view is fast, it could be even faster by caching the result locally.

To do this, use one of the `query.find()` variations, instead of `query.fetch()` or `query.fetchDirect()`:

- `findOneRecord()` - One record, or `null`
- `findAllRecords()` - An Object of records, or `null`
- `findAllRecordsArray()` - If you want an Array result (or `null`)

It will attempt to solve the query locally from the local state. If it cannot, it will send the query to the server.

**If it is able to solve the query locally, the output from the returned Observable will emit synchronously**.

This provides a near instantaneous render experience for the user, plus it prevents hitting the server again for the same data.


**However, there is 1 caveat**: For client accounts, it will only be able to solve the query locally if you use the primary key(s) of the record(s) you need as your query argument. But this is the case for the "Overview" and "Course Content" tabs, so it would work well for you there.

The reason it only works with the primary key is because it relies on unique constraints defined on the model to determine whether it has all the records in the local state. But for client accounts, especially Ontraport objects, there aren't any unique constraints defined on the model other than the primary key. The `unique_id` isn't even set as a unique constraint, but perhaps I can change that if we're 100% certain they are never duplicated.

## Alternate Solution For Non-Primary Key Queries

In addition to the `findXXXRecord()` methods, there are also the `get()` and `fetch()` variations:

- `fetchOneRecord()` - ASYNC - One record, or `null`
- `fetchAllRecords()` - ASYNC - An Object of records, or `null`
- `fetchAllRecordsArray()` - ASYNC - Array result (or `null`)
- `getOneRecord()` - One record, or `null`
- `getAllRecords()` - An Object of records, or `null`
- `getAllRecordsArray()` - Array result (or `null`)

The `get()` variations execute the query against the local state, and they return the result **synchronously** (non-Observable).

**This works regardless of your arguments, and regardless of the complexity of the query.**

The SDK is capable of solving **ALL** queries from the local state, provided you fetched records in the past so that there is something in the local state (`query.fetchAllRecords()`, `query.findAllRecords()`, etc.). 

Otherwise, the `get()` methods will just return `null`.

But you could leverage this in your code like so:

```javascript
const query = model.query()
  .where(...)
  .select(...)
  // ...etc., THEN:
  .noDestroy();
```

The `noDestroy()` is crucial, because by default, calling one of the execution methods (`get`, `find`, `fetch`) will dispose of the query instance once the result is returned. 

Calling `noDestroy()` prevents this behavior. 

Just make sure you then dispose of the query manually (`query.destroy()`) once you're done, or re-enable destroy before a final execution (`query.noDestroy(false)`).

Full Example:

```javascript
const query = model.query()
  .where(...)
  .select(...)
  // ...etc., THEN:
  .noDestroy();

const optimisticRecords = query.getAllRecords({ ?variables: {} });

// Start the fetch before processing any optimistic records.
query
  .noDestroy(false) // So it is disposed automatically after fetch()
  .fetchAllRecords({ ?variables: {} })
  // The following pipe() ensures you get the "main" records,
  // rather than the "pending" version. I'm not
  // going to explain all that right now. But
  // just use the operator for now.
  // 
  // The `toMainInstance()` operator is available
  // on window, so you can call it without any
  // dependencies.
  .pipe(toMainInstance(true))
  .subscribe(records => {
    if (records) {
      // Render any new records/changes    
    }
  })

if (optimisticRecords) {
  // render now
}
```

If you're only expecting 1 record, and `getOneRecord()` returns it, then you don't need to even bother with the `fetch()` at all.

Additionally, if you don't do `query.noDestroy(false)` before your final execution, you can dispose of the query manually like so:

```javascript
query.destroy();
```

### Local Subscriptions

If you want a more "reactive" way of doing it, leverage a local subscription:


```javascript
const query = model.query()
  .where(...)
  .select(...)
  
// The 1st emission occurs synchronously!
const subscription = query.localSubscribeToAllRecords({ 
  ?variables: {} 
}).subscribe(value => {
  const {
    changes, // An Object representing what changed and how 
    state, // An Object containing the records. Always an Object
    size, // Number indicating how many entries in `state`, 0 if none.
  } = value;
  if (size > 0) {
    // Render
  }
});

// Now, fetch. If there are any differences returned 
// from the server, your subscription function above
// will be called automatically, so you don't need to 
// bother with the output of this fetch. 
// 
// The local subscription analyzes every field of every record
// anytime something comes in, and your subscription
// function will only be called if there is at
// least 1 difference. 
// 
// Therefore, with this subscription
// approach, you don't need to bother with trying
// to analyze the differences between the optimistic
// and fetched records to determine if you need
// to update the UI. Anytime your subscription 
// function is called, there is at least 1 update
// needed to the UI.
query.fetchAllRecords({ ?variables: {} }).subscribe();

// To stop the subscription:
subscription.unsubscribe();
```

## Caching/Local State Pro Tip

You could implement some simple logic to prefetch content into the local state before the user requests it. Then, when they switch tabs for example, the content would be instantly available.

But don't go too overboard fetching content unnecessarily. It's not as much of a concern in single-page apps, but in your case, content will be pretty short-lived because most navigations require a page reload. 


# Object Notation

The Query class also supports using Objects to provide your arguments. This may or may not be more readable to you, but I'm just sharing in case it's helpful to you in the future.

## Important Notes

There are a few things to be aware of regarding Object notation
behavior with the query.

### Multiple Keys
If multiple keys are included in the Object, it defaults to using successive `andWhere()` arguments:

```javascript
// Object notation:
query.where({
  key1: 'value1',
  key2: 'value2',
  virtualFieldName: {
    key3: 'value3',
    key4: 'value4',
  }
})

// Equivalent to:
query
  .where('key1', 'value1')
  .andWhere('key2', 'value2')
  .andWhere('virtualFieldName', q => q
    .where('key3', 'value3')
    .andWhere('key4', 'value4')
  )
```

You can override this behavior by providing `_JOIN_: 'or'` in your Object. However, you **must do this at every level**. Meaning, if you provide a nested Object representing virtual field arguments, those arguments will use `andWhere()` unless you also include `_JOIN_: 'or'` in that nested Object.

Example:

```javascript
// Object notation:
query.where({
  _JOIN_: 'or',
  key1: 'value1',
  key2: 'value2',
  virtualFieldName: {
    _JOIN_: 'or', // If you want these to use orWhere()
    key3: 'value3',
    key4: 'value4',
  }
})

// Equivalent to:
query
  .where('key1', 'value1')
  .orWhere('key2', 'value2')
  .orWhere('virtualFieldName', q => q
    .where('key3', 'value3')
    .orWhere('key4', 'value4')
  )
```

### "Intelligent" Grouping

When you use Object notation, it will figure out whether a grouped query is necessary to properly represent the desired arguments.

This is best illustrated with an example:

```javascript
// Object notation:
query
  .where('key', 'value')
  .andWhere({
    _JOIN_: 'or',
    key1: 'value1',
    key2: 'value2',
    virtualFieldName: {
      // Note that `_JOIN_` is not provided, so its andWhere()
      key3: 'value3',
      key4: 'value4',
    }
})

// Equivalent to:
query
  .where('key', 'value')
  .andWhere(q => q
    .where('key1', 'value1')
    .orWhere('key2', 'value2')
    .orWhere('virtualFieldName', q => q
      .where('key3', 'value3')
      .andWhere('key4', 'value4')
    )    
  )
```

Notice how it used a grouped query for `key1` and `key2` because of the `andWhere() - orWhere() - orWhere()`.

However, consider this next example. Notice how it no longer uses groups because they aren't necessary:

```javascript
// Object notation:
query
  .where('key', 'value')
  .andWhere('key2', 'value2')
  .orWhere({
    _JOIN_: 'or',
    key3: 'value3',
    key4: 'value4',
    virtualFieldName: {
      // Note that `_JOIN_` is not provided, so its andWhere()
      key5: 'value5',
      key6: 'value6',
    }
})

// Equivalent to:
query
  .where('key', 'value')
  .andWhere('key2', 'value2')
  .orWhere('key3', 'value3')
  .orWhere('key4', 'value4')
  .orWhere('virtualFieldName', q => q
    .where('key5', 'value5')
    .andWhere('key6', 'value6')
  )    
```

### Operators

When using Object notation, it is always assumed the operator is `=`.

However, it will automatically use `whereIn()` for keys that have an Array of values, and `whereNull()` for keys whose value is `null`:

```javascript
// Object notation:
query
  .where({
    key1: [ 'valueA', 'valueB', 'valueC' ],
    key2: null,
    key3: 'value3',
  })

// Equivalent to:
query
  .whereIn('key1', [ 'valueA', 'valueB', 'valueC' ])
  .andWhereNull('key2')
  .andWhere('key3', 'value3')
```

### Variables

You can use variables (`:varName`) with Object notation, but it won't be able to figure out whether it needs to use `whereIn()` or `whereNull()`. So only use variables with Object notation if you will use a standard value for the variable.

```javascript
// Object notation:
query
  .where('key', 'value')
  .andWhere({
    _JOIN_: 'or',
    key1: ':value1Var',
    key2: 'value2',
    virtualFieldName: {
      key3: ':value3Var',
      key4: 'value4',
    }
})

// Equivalent to:
query
  .where('key', 'value')
  .andWhere(q => q
    .where('key1', ':value1Var')
    .orWhere('key2', 'value2')
    .orWhere('virtualFieldName', q => q
      .where('key3', ':value3Var')
      .andWhere('key4', 'value4')
    )    
  )
```

## Full Object Notation Example

Let's take your original AwcAlert query and use Object notation instead.

I also use an alternate way of providing the `include()` statements to select fields on related models. You're not providing arguments to filter the related records, so you can use the 2nd argument to `select()` to provide the virtual field path instead of using `include()` or `includeFields()`. The `select()` method will then automatically generate the nested `include()` statements for you:

```javascript
awcAlertModel.query()
  .select([
    'id',
    'alert_type',
    'content',
    'created_at',
    'is_mentioned',
    'is_read',
    'notified_contact_id',
    'origin_url',
    'parent_announcement_id',
    'parent_class_id',
    'parent_comment_id',
    'parent_post_id',
    'parent_submission_id',
    'title',
    'unique_id',
  ])
  .select([ 'id', 'class_name' ], [ 'Parent_Class' ])
  .select('course_name', [ 'Parent_Class', 'Course' ])
  .where('notified_contact_id', 10435)
  .andWhere(q => q
    .where({
      alert_type: [
        "Post Mention",
        "Submission Mention",
        "Post Comment Mention",
        "Submission Comment Mention",
        "Announcement Comment Mention"
      ],
      is_mentioned: true
    })
    .orWhereIn('alert_type', [ 'Announcement', 'Announcement Mention' ])
    .orWhere('alert_type', 'Post Comment')
    .andWhere({
      _JOIN_: 'or',
      Parent_Post: {
        author_id: 10435
      },
      Parent_Comment: {
        _JOIN_: 'or',
        author_id: 10435,
        Forum_Post: {
          author_id: 10435
        },
      },
    })
    .orWhere('alert_type', 'Submission Comment')
    .andWhere({
      _JOIN_: 'or',
      Parent_Submission: {
        Student: {
          student_id: 10435
        }
      },
      Parent_Comment: {
        author_id: 10435
      }
    })
    .orWhere('alert_type', 'Announcement Comment')
    .andWhere({
      _JOIN_: 'or',
      Parent_Announcement: {
        instructor_id: 10435
      },
      Parent_Comment: {
        _JOIN_: 'or',
        author_id: 10435,
        Parent_Announcement: {
          instructor_id: 10435
        }
      }
    })
  )

```

For your particular AwcAlert query, the Object notation is probably more confusing and less readable than the standard way.

However, for scenarios where you're including a bunch of `and` arguments, and especially when there are virtual field arguments, the Object notation might be easier for you.

Plus, you can always mix and match. In some scenarios, it might be easier to provide an Object, and in other scenarios the standard way of doing it.

But ultimately, it's all the same. It's just up to your preference.