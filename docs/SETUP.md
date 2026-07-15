# iPhone setup

Complete the Reminders setup before importing the Shortcut.

## 1. Create and share the list

On one iPhone:

1. Open Reminders and create an iCloud list named **Date Ideas**.
2. Add these sections in order: **Inbox**, **Both Want**, **Maybe**, and **Declined**.
3. Share the list with the other person and allow editing.
4. On the other iPhone, accept the invitation and confirm that a test reminder syncs both ways.

Apple does not expose Reminders sections to Shortcuts. New captures include `Status: Inbox` in their notes and may initially appear outside the visual Inbox section. Move them into Inbox when reviewing the list; subsequent moves record the shared outcome.

## 2. Install one personalized copy per person

On each iPhone:

1. Transfer and open `dist/Save Date Idea.shortcut`.
2. Review its actions, then add the shortcut.
3. Answer the import question with that person's display name.
4. Choose the shared **Date Ideas** list when asked for the destination.
5. Open the shortcut's details and confirm **Show in Share Sheet** is enabled for URLs, text, rich text, and Safari webpages.
6. In any Share Sheet, edit favorites and move **Save Date Idea** near the top.

The first run asks for access to Reminders and may ask for permission to search Reminders. Allow both so duplicate detection works.

Run the first end-to-end capture on an iPhone. On macOS 26.5.2, Apple’s built-in Add Reminder action can remain pending when a generated Share Sheet shortcut is run from the editor even though the same reminder payload works through Reminders. This does not validate or invalidate the iPhone action path.

## 3. Daily workflow

1. In iMessage or a source app, long-press/open a link and tap **Share**.
2. Choose **Save Date Idea**. A notification confirms whether it was saved or already existed.
3. Discuss the idea in iMessage.
4. Move the reminder to **Both Want**, **Maybe**, or **Declined** and add context to its note.
5. For an expiring special or exact event, set the reminder's due date. For a recurring happy hour, write the days and times in the note without creating weekly alerts.
6. Flag the reminder when it deserves extra attention.

## 4. Beli handoff

- When a restaurant reaches **Both Want**, both people add it to Beli's want-to-try list and apply a `Date Ideas` label if available.
- Keep timing, source links, and planning notes in Reminders.
- After visiting, each person records their own Beli ranking, dishes, and notes.
- Complete the reminder after the Beli entries are finished.
- Non-restaurant events remain in Reminders only.

## Correcting a capture

Some sites—especially Instagram—may block page metadata. The shortcut falls back to the website host. Rename the reminder during review; the source URL remains intact in the reminder note.

Duplicate detection uses the normalized URL stored in the note. Different links pointing to the same venue can still appear separately; merge those manually during review.

Duplicate lookup depends on the device’s Reminders/Spotlight index. During the first iPhone test, save one URL twice and confirm the second run reports an existing item. If it does not, continue the prototype without relying on automatic deduplication and merge duplicates during review.
