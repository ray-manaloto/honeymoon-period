# Two-week trial

This checklist validates the retained Reminders + Beli baseline. It is not the
active web MVP plan; use [`docs/product/web-mvp-plan.md`](product/web-mvp-plan.md)
for current implementation and completion criteria.

Start with new links; do not bulk-import old iMessages.

## Validation checklist

- [ ] Both people can add and edit reminders in the shared list.
- [ ] Save one link from Instagram, Yelp, OpenTable, Tock, Resy, and a restaurant website.
- [ ] A site with blocked metadata still creates a usable reminder.
- [ ] Sharing the exact same link twice shows the duplicate notification.
- [ ] An expiring special fires at the manually selected due date.
- [ ] A recurring happy hour is recorded without unwanted weekly alerts.
- [ ] Ideas move cleanly through Both Want, Maybe, Declined, and completed history.
- [ ] A Both Want restaurant is added to both Beli want-to-try lists.
- [ ] After a visit, both people can finish Beli notes and complete the reminder.

## Review after two weeks

Record only observed friction:

- Bad titles or duplicate venues: add a small link-resolution service.
- Need structured fields or richer views: move the shared list to Notion.
- Availability is the bottleneck: trial Howbout for scheduling.
- Need independent scores, comments, automatic urgency, or venue-level merging: validate the approved API-first web MVP.
