## Context
Board search state (`board.search`) is a single string, already debounced (400ms) in `Filters.jsx` and dispatched via `entryActions.searchInCurrentBoard`. Matching logic (`buildSearchParts`) is duplicated between client (`client/src/utils/build-search-parts.js`) and server (`server/utils/build-query-parts.js`) for a *different* feature (paginated "endless" list search) — this change only touches the client copy.

All data this feature needs — card title/description, custom field groups/fields/values, list name/position — is eagerly loaded into Redux with the board (`server/api/controllers/boards/show.js`). Comments are not, and are out of scope. Archive/trash-type lists are excluded from the board payload entirely (`FINITE_TYPES = [active, closed]`), so archived/trashed cards are structurally unavailable to a client-only implementation.

## Goals / Non-Goals
- Goals: board-wide "jump to card" dropdown; custom field matching; no new network requests.
- Non-Goals: searching comments, tasks, or labels; searching archived/trashed cards; a dedicated full search-results page; server-side/full-text search.

## Decisions
- **Decision**: Implement entirely client-side, as a new derived selector over existing redux-orm state, not a new API endpoint.
  - Alternatives considered: server-side search endpoint (would allow including archived/trashed cards and comments) — rejected because it's a bigger scope change than the requested fix, and all requested match fields are already client-resident.
- **Decision**: Reuse `buildSearchParts` for tokenization and `/regex/` detection; extend the matching predicate (not the tokenizer) to also test custom field name + content per card.
  - Alternatives considered: writing a separate matcher for the dropdown — rejected, would let dropdown and in-place-filter matching semantics drift apart over time.
- **Decision**: Rank dropdown results client-side: partition matches into title / description / custom-field buckets in that priority order, then sort each bucket by list position, then concatenate.
- **Decision**: Exclude archive/trash cards rather than triggering a fetch-on-search. Documented as a known limitation, not silently dropped.

## Risks / Trade-offs
- Ranking/snippet computation runs over every card in the board on each keystroke (debounced 400ms). Acceptable for typical board sizes; if boards with thousands of cards become a problem, revisit with memoized per-card searchable-text precomputation.
- Users may expect archived cards to be searchable ("where did that go") — explicitly out of scope for this change; flagged as a natural follow-up.

## Open Questions
None — resolved through user grilling session prior to this proposal.
