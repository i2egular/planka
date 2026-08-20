# Change: Add card search dropdown to board search

## Why
Board search currently only narrows cards in place within each visible list, matching title and description only. Finding a specific card requires scrolling through every list, and custom field values aren't searchable at all — even though custom fields are already loaded with the board.

## What Changes
- Add a live dropdown under the board search box showing matching cards from the entire board (all lists, all swimlanes), in addition to the existing in-place list filtering.
- Extend search matching to include custom field name and content, alongside the existing title/description match (both plain-text and `/regex/` modes).
- Each dropdown result shows a highlighted match snippet and the source list name.
- Results are ranked by relevance (title match first) with board position as a tiebreaker, capped at 8 with inline "load more".
- Selecting a result (click or Enter) opens the card detail modal directly.
- Dropdown supports arrow-key navigation and a two-stage Escape (close dropdown, then clear search).
- Archived and trashed cards remain out of scope (they aren't part of the board's initial data load).

## Impact
- Affected specs: `board-search` (new capability)
- Affected code:
  - `client/src/components/boards/BoardActions/Filters.jsx` — search input, add dropdown UI and keyboard handling
  - `client/src/utils/build-search-parts.js` — reused for tokenizing/regex detection; extend matching to custom fields
  - `client/src/models/Board.js` — `getFilteredCardsModelArray` currently drives in-place filtering; new selector needed for board-wide ranked dropdown results
  - `client/src/models/CustomFieldValue.js`, `CustomField.js` — read for match text
  - New dropdown result component under `client/src/components/boards/BoardActions/` (or similar)
  - No server/API changes — feature is entirely client-side against already-loaded Redux state
