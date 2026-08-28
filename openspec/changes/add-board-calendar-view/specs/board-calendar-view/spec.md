## ADDED Requirements

### Requirement: Calendar Board View Mode
The board SHALL offer "Calendar" as a fourth view mode alongside Kanban, Grid, and List, selectable from the same runtime view switcher and available as a board's persisted default view.

#### Scenario: Switching to Calendar view
- **WHEN** a user selects "Calendar" from the board view switcher
- **THEN** the board SHALL render the Calendar view instead of Kanban/Grid/List, without navigating away from the board

#### Scenario: Setting Calendar as the board's default view
- **WHEN** a board manager sets "Calendar" as the default view in the board's preferences
- **THEN** the board SHALL open in Calendar view by default for subsequent visits, consistent with how Kanban/Grid/List defaults already behave

#### Scenario: Calendar view unavailable outside the live board
- **WHEN** the board context is Archive or Trash rather than the live board
- **THEN** the Calendar view option SHALL be unavailable, consistent with existing restrictions on the Kanban option in those contexts

### Requirement: Calendar Grid Granularity
Calendar view SHALL support both Week and Month grid granularities, toggled by the user without leaving the view.

#### Scenario: Switching from Month to Week
- **WHEN** a user toggles from Month to Week granularity
- **THEN** the grid SHALL re-render as a 7-day-wide strip of day cells covering the currently selected week

#### Scenario: Time-of-day is not used for grid position
- **WHEN** a card has a `dueDate` with a specific time of day
- **THEN** neither Week nor Month granularity SHALL position the card by that time — both lay out whole-day cells only

### Requirement: Card Placement by Due Date
Calendar view SHALL place each eligible card into the day cell matching the date portion of its `dueDate`, ordering cards within a day cell by the full `dueDate` timestamp.

#### Scenario: Card appears on its due date
- **WHEN** a card has `dueDate` of a given calendar day
- **THEN** that card SHALL appear in that day's cell

#### Scenario: Multiple cards due the same day are time-ordered
- **WHEN** two or more cards share the same due date but different due times
- **THEN** they SHALL appear within that day's cell ordered by due time, earliest first

### Requirement: Undated Cards Excluded
Cards without a `dueDate` SHALL NOT appear anywhere in Calendar view.

#### Scenario: Card has no due date
- **WHEN** a card's `dueDate` is not set
- **THEN** that card SHALL be omitted from Calendar view entirely, with no separate "undated" listing shown

### Requirement: Completed Due Cards Remain Visible
Cards whose due date is marked complete (`isDueCompleted`) SHALL still render on their due-date cell, visually distinguished as completed.

#### Scenario: Completed card still shows on its due date
- **WHEN** a card's `isDueCompleted` is true
- **THEN** the card SHALL still appear on its due-date cell, styled as dimmed/checked to match the existing completed state used by the due-date chip elsewhere on the board

### Requirement: Calendar Entry Content
Each card's entry in Calendar view SHALL display only the card's title.

#### Scenario: Entry omits label swatches
- **WHEN** a card with one or more labels appears in Calendar view
- **THEN** its entry SHALL show only the card title, without label-color swatches

### Requirement: Day Cell Overflow Handling
A day cell containing more cards than its display capacity SHALL show a capped set of entries plus a "+N more" control that reveals the remaining cards, rather than growing the cell.

#### Scenario: Day with more cards than fit
- **WHEN** a day cell contains more due cards than its display cap
- **THEN** the cell SHALL show the cards up to the cap plus a "+N more" indicator for the remainder, and interacting with that indicator SHALL reveal the rest

### Requirement: Swimlane-Agnostic Pooling
Calendar view SHALL pool cards from all of a board's lists and swimlanes into a single calendar, without representing swimlane grouping.

#### Scenario: Cards from different swimlanes share a day cell
- **WHEN** cards from two different swimlanes both have the same due date
- **THEN** they SHALL appear together in that day's cell with no swimlane distinction shown

### Requirement: Calendar Respects Active Board Filters
Calendar view SHALL only show cards that pass the board's currently active filters (label, member, search text), using the same filtered card set as Kanban, Grid, and List views.

#### Scenario: Filter narrows calendar contents
- **WHEN** a label or member filter is active on the board
- **THEN** Calendar view SHALL show only cards matching that filter, consistent with what Kanban/Grid/List would show for the same filter

### Requirement: Card Selection Opens Card Modal
Clicking a card's entry in Calendar view SHALL open that card's existing detail modal. Calendar view SHALL NOT support dragging a card to change its due date.

#### Scenario: Click opens card modal
- **WHEN** a user clicks a card entry in Calendar view
- **THEN** that card's detail modal SHALL open, where the due date can be edited manually via the existing due-date editing step

#### Scenario: Dragging a card has no effect
- **WHEN** a user attempts to drag a card entry within Calendar view
- **THEN** no rescheduling SHALL occur — the card's `dueDate` SHALL remain unchanged
