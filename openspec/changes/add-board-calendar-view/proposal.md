# Change: Add Calendar board view

## Why
Boards currently only offer date-agnostic views (Kanban/Grid/List). Seeing what's due this week or month requires scanning every list by hand, since due dates aren't laid out on a timeline anywhere. A due-date Calendar view answers "what's due this week/month" directly.

## What Changes
- Add a new "Calendar" Board View mode alongside Kanban/Grid/List — full parity with Grid/List, including selectability as a board's persisted default view.
- Calendar View renders cards in a day-column grid, with a toggle between Week and Month granularity. Time-of-day is not used for layout in either granularity (no hourly agenda).
- Cards are placed by `dueDate` (date portion only); within a day cell, cards are ordered by due time.
- Cards without a `dueDate` are excluded entirely — no "undated" bucket in this iteration.
- Cards with `isDueCompleted` still render on their due-date cell, shown dimmed/checked (same visual treatment as the existing `DueDateChip` "completed" state).
- Each calendar entry shows the card title only — no label-color swatches, to avoid clutter/ambiguity from cards with multiple labels.
- A day cell with more cards than fit is capped, with a "+N more" affordance to reveal the rest, rather than growing the cell.
- Calendar View pools cards from all lists and swimlanes into a single board-wide calendar; swimlane grouping is not represented in this view.
- Calendar View honors the board's existing filters (label, member, search text) via the same filtered-cards selector already used by Kanban/Grid/List.
- Clicking a card opens the existing Card Modal. There is no drag-and-drop rescheduling in this iteration — due dates are edited manually via the existing `EditDueDateStep` flow.
- Out of scope for this change: Gantt/timeline view (would need a new start-date/duration field on Card, which doesn't exist today), a cross-board calendar, drag-to-reschedule, and an "undated cards" bucket. Each may become its own future change.

## Impact
- Affected specs: `board-calendar-view` (new capability)
- Affected code:
  - Server: `server/api/models/Board.js` — extend the `Views` enum with `CALENDAR` (no migration needed; `default_view` is validated by `isIn`, not a DB check constraint)
  - Client:
    - `client/src/constants/Enums.js` — extend `BoardViews`
    - `client/src/constants/Icons.js` — extend `BoardViewIcons`
    - `client/src/components/boards/BoardActions/RightSide/RightSide.jsx` — add Calendar to the runtime view switcher
    - `client/src/components/boards/BoardSettingsModal/PreferencesPane/DefaultView.jsx` — add Calendar to the default-view picker and its description map
    - `client/src/components/boards/Board/Board.jsx`, `client/src/components/boards/Board/FiniteContent.jsx` — dispatch to a new Calendar view component, following the existing `GridView`/`ListView` precedent (read-mostly rendering, no drag-and-drop)
    - New `client/src/components/boards/Board/CalendarView/` component tree — month/week grid, day-cell rendering, "+N more" overflow, card entry
    - New selector deriving date-bucketed cards from the existing `selectors.selectFilteredCardIdsForCurrentBoard` (reuses current filtering as-is)
    - New locale keys for the "Calendar" view name and its default-view description, added to `client/src/locales/en-US/core.js` (other locales follow the project's normal translation process)
