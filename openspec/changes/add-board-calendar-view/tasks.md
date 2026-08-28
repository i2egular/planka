## 1. Server: view enum

- [x] 1.1 Add `CALENDAR` to the `Views` enum in `server/api/models/Board.js` (`isIn` validation only, no migration)
- [x] 1.2 Update the Board model's swagger/API doc comment for `defaultView` to list the new value

## 2. Client: view-mode plumbing

- [x] 2.1 Add `CALENDAR` to `BoardViews` in `client/src/constants/Enums.js`
- [x] 2.2 Add a calendar icon entry to `BoardViewIcons` in `client/src/constants/Icons.js`
- [x] 2.3 Add "Calendar" to the runtime view switcher in `client/src/components/boards/BoardActions/RightSide/RightSide.jsx`, respecting the existing `board.context === BOARD` restriction
- [x] 2.4 Add "Calendar" to the default-view picker and its description map in `client/src/components/boards/BoardSettingsModal/PreferencesPane/DefaultView.jsx`
- [x] 2.5 Add locale keys for the Calendar view name and default-view description to `client/src/locales/en-US/core.js`
- [x] 2.6 Wire the new view into the render dispatch in `client/src/components/boards/Board/Board.jsx` / `FiniteContent.jsx`, following the existing Grid/List branch pattern

## 3. Calendar data selector

- [x] 3.1 Add a selector that takes `selectFilteredCardIdsForCurrentBoard` and buckets resulting cards by the date portion of `dueDate`, dropping cards with no `dueDate`
- [x] 3.2 Within each date bucket, sort cards by full `dueDate` timestamp (earliest first)
- [x] 3.3 Unit tests for the grouping logic (undated cards excluded, same-day cards ordered by time, cards spanning multiple months bucket correctly) — written against the pure `groupCardIdsByDueDate` util the selector wraps; filtered-out (label/member/search) cards are excluded upstream by the existing, already-tested `getFilteredCardsModelArray`, so no separate ORM-selector test was added

## 4. Calendar view UI

- [x] 4.1 Create `client/src/components/boards/Board/CalendarView/` with a Month grid (day cells laid out by calendar week rows) and a Week grid (7-day-wide strip), sharing a common day-cell component
- [x] 4.2 Add a granularity toggle (Week/Month) plus navigation (previous/next period, "today") within the view
- [x] 4.3 Implement the day-cell card entry showing title only, with completed (`isDueCompleted`) cards rendered dimmed/checked to match the existing `DueDateChip` completed styling
- [x] 4.4 Implement per-day overflow capping with a "+N more" control that reveals the remaining cards for that day
- [x] 4.5 Wire card entry click to open the existing Card Modal (no drag handling implemented)

## 5. Verification

- [x] 5.1 `npm run client:lint` — clean
- [x] 5.2 `npm run client:test` — fixed by `npm ci` in `client/` (stale/corrupted install, not an actual version conflict); full suite now green (3 suites, 22 tests, including the 5 new due-date grouping tests)
- [x] 5.3 `npm run server:lint` — clean
- [x] 5.4 Manual check on a running board — done, via an isolated dev stack (`docker-compose-dev.yml`, project name `test`, remapped to ports 1338/3010 to avoid colliding with other services already running on this machine, and kept separate from the production `docker-compose.yml`'s `planka_db-data` volume). Verified: Calendar appears in the view switcher and default-view picker with correct description; Week/Month toggle and period label work; cards bucket onto their due date and sort by due time within a day (Card B 9am before Card A 12pm); a completed due date renders dimmed with a checkmark (Card A); a day with more cards than the cap shows "+N more" and expands to reveal the rest on click (4 cards on Aug 28, capped at 3 in Month view); clicking a card opens the existing Card Modal. Found and fixed one real bug in the process: `CalendarView.module.scss` originally set `height: 100%` + flex-column on `.wrapper`, which (unlike Grid/List's pattern) didn't get a bounded height from its flex ancestor and let content overflow into the page-level scroll, causing the fixed board header to visually overlap the calendar at short viewport heights — fixed by matching Grid/List's simpler wrapper pattern (no explicit height/flex, `grid-auto-rows: minmax(..., auto)` instead of `1fr`).
