## Context
Board search (`add-card-search-dropdown`) works entirely client-side because a board's cards are fully loaded into Redux when the board is opened. A project can have many boards, and only the currently open board's cards are ever in client state (`server/api/controllers/projects/show.js` returns board metadata only, not lists/cards). Cross-board search therefore needs a server-side query, not a client-side selector.

## Goals / Non-Goals
- Goals:
  - Search card name + description across every board in the open project, respecting per-board visibility.
  - Reuse the board search UX (dropdown, ranking, highlighting, keyboard nav, navigation via `Paths.CARDS`) so behavior is familiar.
  - Keep the query cheap: single indexed SQL query, capped result count, no N+1 per-board fetches.
- Non-Goals:
  - Custom field search (adds join complexity across boards with different custom field groups; can follow as a later increment, same as it did for board search).
  - A dedicated search results page/route — dropdown-only, matching the existing board search pattern.
  - Searching archive/trash lists.

## Decisions
- **Decision: New server endpoint `GET /api/projects/:id/cards?search=...`** rather than expanding client state.
  - Alternative considered: fetch full board payload (`GET /api/boards/:id`) for every board in the project on first keystroke and search client-side. Rejected — not scalable (N requests, large payloads) for projects with many boards, and results would go stale immediately since those boards' data isn't kept in sync via sockets unless actually open.
- **Decision: Reuse the raw-SQL search branch pattern from `Card.qm.getByEndlessListId`** (join + `ILIKE ALL` per token, or `~*` for `/regex/` mode), extended with `list.type IN ('active','closed')` and `board.project_id = $projectId`, further restricted to an explicit `boardIds` allowlist computed the same way `projects/show.js` computes visible boards (project managers/admins see all boards; other members see only boards they have a `BoardMembership` for).
- **Decision: Results are not normalized into redux-orm.** They're rendered directly from the API response in local component state, same lifecycle as the existing board-search dropdown's ephemeral results, avoiding partial/stale card records in the store for boards not otherwise loaded.
- **Decision: Reuse/generalize `SearchDropdown` and `HighlightedText`** rather than duplicating them — add an optional `boardName` field to the result row so both board-scoped and project-scoped dropdowns share one component.

## Risks / Trade-offs
- Large projects (many boards/cards) — mitigated by `LIMIT` in SQL (matching the `LIMIT = 50` convention in `Card.js` query methods) plus the existing 8-per-page dropdown cap client-side; debounce (400ms, matching board search) avoids a query per keystroke.
- Permission correctness — must not leak cards from boards the user can't see; boardIds allowlist is computed server-side per request, not trusted from the client.
- Regex mode (`/pattern/`) on Postgres `~*` across a larger row set than single-board search — same risk profile as the existing endless-list search branch, which already handles invalid-regex errors gracefully (catches `E_QUERY_FAILED` and returns empty results).

## Migration Plan
Additive only — new endpoint, new UI element. No schema changes, no changes to existing endpoints' behavior.

## Open Questions
- Should the navbar search box be hidden entirely on narrow/mobile viewports, or collapse into an icon-triggered overlay? (Board search has no direct mobile precedent to follow here — decide during implementation based on `Header.module.scss` responsive breakpoints.)
