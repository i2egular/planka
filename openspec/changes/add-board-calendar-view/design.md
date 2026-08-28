## Context
Planka already has a pluggable board-view system: a server `Views` enum (`KANBAN`, `GRID`, `LIST`) persisted per-board as `defaultView`, plus an ephemeral per-session `board.view` seeded from it. Grid and List views are read-mostly (no `react-beautiful-dnd`) and both receive their cards pre-filtered via `selectors.selectFilteredCardIdsForCurrentBoard`, the same selector Kanban uses. Cards carry a single relevant date field, `dueDate` (nullable timestamp) plus `isDueCompleted` (boolean); there is no start-date or duration field on Card. `FiniteContent.jsx` renders against a board's full set of active/closed-list cards, already loaded into normalized Redux state on board open (no pagination) — so a calendar view has every card it needs in memory already, with no new fetch.

## Goals / Non-Goals

**Goals:**
- Add "Calendar" as a fourth Board View, following the existing Kanban/Grid/List plumbing exactly: view switcher, per-board default-view picker, locale keys.
- Show cards on a day-grid by `dueDate`, toggling between Week and Month granularity, consistent with the board's currently active filters (label/member/search).

**Non-Goals:**
- Gantt/timeline view — needs a start-date/duration field that doesn't exist on Card today; a separate future change.
- Drag-and-drop rescheduling — cards are opened via the existing Card Modal instead; due dates are still edited through the existing `EditDueDateStep`.
- A cross-board calendar — this view stays board-scoped, like every other board view.
- An "undated cards" bucket — cards without a `dueDate` are simply not shown.
- Swimlane-aware grouping within the calendar.

## Decisions

- **Decision**: Implement entirely client-side, as a new derived selector bucketing the board's already-filtered cards (`selectFilteredCardIdsForCurrentBoard`) by date, rather than a new API endpoint.
  - Alternatives considered: a dedicated calendar-data endpoint with server-side date bucketing — rejected, since every card the view needs is already loaded into Redux for the other views.
- **Decision**: Extend the `Views`/`BoardViews` enums with `CALENDAR`, following the Grid/List precedent exactly: server enum + `isIn` validation, client enum + icon + view-switcher entry + default-view picker entry. No DB migration needed, since `default_view` has no check constraint, only application-level `isIn` validation.
  - Alternatives considered: a separate boolean/feature-flag column for enabling Calendar — rejected as unnecessary; this is additive parity with existing views, not an experimental gate.
- **Decision**: Calendar View is read-mostly, like Grid/List — no drag-and-drop. Clicking a card opens the existing Card Modal.
  - Alternatives considered: drag-to-reschedule (drag a card to a new day to update `dueDate`) — deferred; `react-beautiful-dnd` is wired for list/card reordering, not free-form date-axis dragging, so this would need its own drag implementation and was explicitly descoped for v1.
- **Decision**: Bucket a card into a day cell using the date portion of `dueDate` only (time-of-day ignored for placement); within a day cell, cards are ordered by the full `dueDate` timestamp.
  - Alternatives considered: an hourly agenda grid (time-of-day determines vertical position, à la Google Calendar) — rejected as disproportionate scope for a view whose job is "what's due this week/month," not precise scheduling.
- **Decision**: Cap the number of card entries rendered per day cell, with a "+N more" control to reveal the rest, rather than letting the cell grow.
  - Alternatives considered: unbounded cell growth — rejected, since one busy day would inflate an entire calendar row and break grid alignment.
- **Decision**: Render only the card title in each calendar entry — no label-color swatches.
  - Alternatives considered: showing label swatches (as Kanban cards do) — rejected, since a card can carry multiple labels and small multi-swatch rendering was judged more confusing than helpful at calendar-entry size.

## Risks / Trade-offs

- [A single day with many due cards could still feel cramped even with capping] → the "+N more" affordance keeps cell height fixed regardless of volume; exact cap count is a visual-tuning detail decided during implementation.
- [Users may expect drag-to-reschedule once a calendar exists] → explicitly deferred, not silently dropped; documented here as a natural follow-up change.
- [Time-of-day is discarded for grid placement but still used for intra-day ordering] → could read as inconsistent to a user who set a specific due time; accepted as the simplest option consistent with keeping v1 non-interactive and date-grid-based.
- [Deriving date buckets recomputes over all of a board's filtered cards] → acceptable, since Grid/List already iterate the same full card set on every board; revisit with memoization only if very large boards show jank.

## Migration Plan
No data migration required. The only schema-adjacent change is adding `CALENDAR` to the `Views` enum, which is an application-level `isIn` validation, not a database constraint. No feature flag — this ships as additive parity with the existing Grid/List views.

## Open Questions
None — resolved through a user grilling session prior to this proposal (see `proposal.md`).
