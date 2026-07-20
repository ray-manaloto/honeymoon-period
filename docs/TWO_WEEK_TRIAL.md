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

- Record bad titles, duplicate venues, structured-field gaps, availability friction,
  and ranking needs as historical baseline evidence. Do not add a resolver, migrate to
  Notion, trial a scheduling authority, or reopen the accepted API-first path from this
  retained checklist. Current product decisions and implementation authority live in
  the repository product requirements and web MVP plan.
