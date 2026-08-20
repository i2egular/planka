# Project Context

## Purpose
Planka is a Trello-style kanban board application: projects contain boards, boards contain lists and swimlanes, lists contain cards. Cards support labels, members, custom fields, tasks/checklists, comments, and attachments.

## Tech Stack

### server (API)
- **Framework**: Sails.js (Waterline ORM) on Node.js
- **Database**: PostgreSQL, accessed via Waterline models plus raw parameterized SQL for query-heavy lookups (`server/api/hooks/query-methods/models/`)
- **Realtime**: Socket.io for board/card update broadcasts

### client (Web UI)
- **Framework**: React with Redux (redux-orm for normalized entity state, redux-saga for async flows split into `entry-actions` → sagas → `actions`)
- **UI kit**: semantic-ui-react, with local wrappers in `client/src/lib/custom-ui`
- **i18n**: react-i18next

## Project Conventions

### Code Style
- **Linting**: ESLint (`npm run server:lint`, `npm run client:lint`, or `npm run lint` for both) — run before considering a change done
- **Pre-commit**: husky + lint-staged run linting on staged files automatically

### Architecture Patterns
- **Client data flow**: UI dispatches an `entry-action` → a saga performs the async work (API call and/or `EntryActionTypes`) → plain `actions` update redux-orm models. Board data (cards, lists, labels, custom fields, tasks) is fetched in bulk on board load and kept in normalized Redux state; comments are the exception and are fetched lazily only when a card is opened.
- **Server query methods**: List/board controllers assemble their response payload from `*.qm.*` query-method helpers (`server/api/hooks/query-methods/models/`), which wrap Waterline or raw SQL. Search/filter logic that needs to match the same behavior on client and server (e.g. plain-text vs `/regex/` search parsing) is implemented as parallel utilities: `client/src/utils/build-search-parts.js` and `server/utils/build-query-parts.js`.
- **Archived/trashed cards**: Lists have a `type` of `active`, `closed`, `archive`, or `trash`. Only `active`/`closed` (`FINITE_TYPES`) lists are included in the initial board fetch (`server/api/controllers/boards/show.js`); archive/trash cards are fetched separately, on demand.

### Testing
- `npm run server:test` / `npm run client:test` (or `npm test` for both)

### Search Guidance
- Use `rg` (ripgrep) for code search.
