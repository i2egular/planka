## 1. Matching logic
- [x] 1.1 Extend the client search-matching predicate (built on `buildSearchParts`) to also test each card's custom field names and content, for both plain-text and `/regex/` modes
- [x] 1.2 Add a memoized selector that computes, for the current board and search text, a ranked list of `{ card, list, matchField, snippet }` across active/closed lists only (excluding archive/trash), sorted title-match-first then by board position
- [x] 1.3 Unit tests for the matcher (title/description/custom-field-name/custom-field-content matches, regex mode, archive/trash exclusion) and the ranking selector

## 2. Snippet & highlighting
- [x] 2.1 Implement snippet extraction (short excerpt around the match) and highlight-span rendering for plain-text and regex matches
- [x] 2.2 Unit tests for snippet extraction on short/long text and multi-token matches

## 3. Dropdown UI
- [x] 3.1 Add dropdown component rendered under the search input in `Filters.jsx`, showing up to 8 results with title (highlighted if matched), snippet, and source-list tag
- [x] 3.2 Implement inline "load more" (reveal next batch / enable scroll) beyond the initial 8
- [x] 3.3 Wire result click and Enter-on-highlighted-row to open the card detail modal (existing `Paths.CARDS` navigation)

## 4. Keyboard interaction
- [x] 4.1 Arrow-key navigation moving a highlighted selection through dropdown rows
- [x] 4.2 Two-stage Escape: first press closes dropdown only, second press clears search (extends existing `cancelSearch` behavior)

## 5. Verification
- [x] 5.1 `npm run client:lint`
- [x] 5.2 `npm run client:test`
- [x] 5.3 Manual check in a running board: multi-list/swimlane match, custom-field match, regex mode, 8+ result pagination, keyboard navigation, archive/trash exclusion
