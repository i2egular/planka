## ADDED Requirements

### Requirement: Project-Wide Card Search Endpoint
The system SHALL provide a server endpoint that searches card name and description across all boards within a given project, restricted to boards the requesting user is permitted to view, and excluding archive/trash lists.

#### Scenario: Match across multiple boards
- **WHEN** a user with membership on multiple boards in a project searches for a term present in card names on two different boards
- **THEN** the response includes matching cards from both boards, each identified with its board and list

#### Scenario: Board visibility is respected
- **WHEN** a user searches a project containing a board they are not a member of, and that board has a matching card
- **THEN** the response does not include that card

#### Scenario: Regex search mode
- **WHEN** the search input starts and ends with `/` (e.g. `/^foo/`)
- **THEN** the remaining text is treated as a case-insensitive regular expression matched against card name or description

#### Scenario: Invalid regex is handled gracefully
- **WHEN** the search input is in regex mode but is not a valid regular expression
- **THEN** the endpoint returns an empty result set instead of an error

#### Scenario: Archive and trash excluded
- **WHEN** a matching card exists only in an archive or trash list
- **THEN** it is excluded from the results

### Requirement: Navbar Project Search UI
The client SHALL provide a search input in the top navbar, centered between the existing left and right navbar groups, visible whenever a project is open, that lets the user search cards across the current project's boards.

#### Scenario: Dropdown shows ranked results
- **WHEN** the user types two or more characters into the navbar search box
- **THEN** a dropdown appears below the input showing up to 8 matching cards, each with a highlighted match snippet, its board name, and its list name

#### Scenario: Load more results
- **WHEN** more than 8 cards match and the user requests more
- **THEN** additional results are revealed without losing the current selection state

#### Scenario: Keyboard navigation
- **WHEN** the dropdown is open and the user presses the down or up arrow key
- **THEN** the highlighted result moves to the next or previous row, wrapping at the ends

#### Scenario: Select result via Enter or click
- **WHEN** the user presses Enter while a result is highlighted, or clicks a result
- **THEN** the app navigates to that card's detail view

#### Scenario: Two-stage Escape
- **WHEN** the dropdown is open and the user presses Escape
- **THEN** the dropdown closes and the search text is preserved; **WHEN** Escape is pressed again
- **THEN** the search text is cleared
