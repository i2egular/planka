# Change: Add project-wide card search to the top navbar

## Why
The existing board search (`add-card-search-dropdown`) only finds cards on the currently open board. Projects commonly have several boards, and there is no way to find a card without knowing (or guessing) which board it lives on. Users need a way to search across every board in the current project from one place.

## What Changes
- Add a search input in the middle of the top navbar (`client/src/components/common/Header/Header.jsx`), visible whenever a project is open.
- Add a new server endpoint that searches cards across all boards in a project the current user can access, matching card name and description (plain-text and `/regex/` modes, same syntax as board search).
- Add a debounced dropdown (reusing the `SearchDropdown`/`HighlightedText` pattern from board search) showing up to 8 ranked results, each labeled with its board and list name, with inline "load more".
- Keyboard support: arrow-key navigation, Enter to open, two-stage Escape (close dropdown, then clear input).
- Selecting a result navigates to the card via the existing `Paths.CARDS` route (unchanged — resolves to the correct board automatically).
- Respects existing visibility rules: only boards the current user is a member of (or all boards, for project managers/admins) are searched.
- Archived and trashed cards are excluded (only `active`/`closed` lists are searched), matching board search's scope.
- Custom field search is out of scope for this change (board search added it later, as a separate increment); project-wide search starts with name/description only to keep the query simple and fast across many boards.

## Impact
- Affected specs: `project-search` (new capability)
- Affected code:
  - Server:
    - `server/api/hooks/query-methods/models/Card.js` — new `getByProjectId(projectId, { search, boardIds, limit })` query method (raw SQL, modeled on the existing `getByEndlessListId` search branch), joining `card` → `list` → `board` and filtering `board.project_id`, `list.type IN ('active', 'closed')`
    - New controller `server/api/controllers/cards/index-in-project.js`, new route `GET /api/projects/:id/cards?search=...` in `server/config/routes.js`, reusing the board-visibility logic from `server/api/controllers/projects/show.js`
  - Client:
    - `client/src/components/common/Header/Header.jsx`, `Header.module.scss` — new centered search box
    - New `client/src/api/` client method for the search endpoint (no redux-orm normalization needed — results are ephemeral, not stored)
    - New component(s) reusing `client/src/components/boards/BoardActions/SearchDropdown/` (may need to generalize it to accept a board-name field, or fork a project-scoped variant)
    - `client/src/utils/build-search-parts.js` reused as-is for tokenizing
  - No changes to `client/src/models/*` (results aren't merged into normalized board/card state, since most other boards' full card records generally aren't loaded)
