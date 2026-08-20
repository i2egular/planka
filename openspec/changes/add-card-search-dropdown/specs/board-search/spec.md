## ADDED Requirements

### Requirement: In-Place Card Filtering
The board SHALL filter the cards displayed within each list based on the current search text, matching against card title and description. This requirement documents existing behavior that the new dropdown (below) extends but does not replace.

#### Scenario: Plain-text search narrows visible cards
- **WHEN** a user types text into the board search box that does not start with `/`
- **THEN** each list SHALL show only cards whose title or description contains every whitespace/comma-separated token, case-insensitively

#### Scenario: Regex search mode
- **WHEN** the search text begins with `/`
- **THEN** the remainder SHALL be treated as a case-insensitive regular expression tested against card title and description

### Requirement: Search Match Fields
Search matching, for both in-place filtering and the search dropdown, SHALL include card custom fields (field name and field content) in addition to card title and description.

#### Scenario: Match on custom field content
- **WHEN** the search text matches the content of a custom field value on a card
- **THEN** that card SHALL be considered a match

#### Scenario: Match on custom field name
- **WHEN** the search text matches the name of a custom field attached to a card
- **THEN** that card SHALL be considered a match, regardless of that field's content

### Requirement: Card Search Dropdown
The board search box SHALL show a dropdown of matching cards drawn from the entire board (all lists and swimlanes, regardless of current scroll position), as the user types.

#### Scenario: Dropdown appears after minimum input
- **WHEN** the user has typed at least 2 characters into the board search box
- **THEN** a dropdown SHALL appear, debounced from further keystrokes, listing cards matching the current search text and mode (plain-text or `/regex/`)

#### Scenario: Dropdown searches the whole board
- **WHEN** a matching card belongs to a list that is not currently scrolled into view, or to a different swimlane than the one currently visible
- **THEN** that card SHALL still appear in the dropdown results

#### Scenario: Dropdown excludes archived and trashed cards
- **WHEN** a card belongs to a list of type `archive` or `trash`
- **THEN** that card SHALL NOT appear in the dropdown or in-place filter results

### Requirement: Search Result Snippet
Each dropdown result SHALL display a short snippet of the matched text with the match highlighted, using the first match found in priority order: title, then description, then custom fields.

#### Scenario: Match found in title only
- **WHEN** a card's title matches the search text
- **THEN** the dropdown result SHALL highlight the matched portion within the displayed title, without an additional snippet line

#### Scenario: Match found in description
- **WHEN** a card's title does not match but its description does
- **THEN** the dropdown result SHALL show a short excerpt of the description with the matched text highlighted

#### Scenario: Match found only in a custom field
- **WHEN** a card matches only via a custom field's name or content
- **THEN** the dropdown result SHALL show that field's name and content as the snippet, with the matched portion highlighted

### Requirement: Search Result Ranking and Display
Dropdown results SHALL be ordered by relevance, with title matches ranked above description/custom-field-only matches, and board position (list order, then card position) used as a tiebreaker within each relevance tier. Each result SHALL display a tag indicating the name of the list the card belongs to.

#### Scenario: Title matches rank first
- **WHEN** the dropdown has both a card matching by title and a card matching only by description
- **THEN** the title-matching card SHALL appear above the description-matching card

#### Scenario: Result shows source list
- **WHEN** a card appears as a dropdown result
- **THEN** its row SHALL display the name of the list it currently belongs to

### Requirement: Search Result Pagination
The dropdown SHALL initially show at most 8 results, with additional matching cards revealed inline (via scrolling or a "load more" action) within the same dropdown rather than navigating to a separate view.

#### Scenario: More than 8 matches exist
- **WHEN** more than 8 cards match the current search
- **THEN** the dropdown SHALL show the first 8 by rank and offer a way to reveal more results within the same dropdown

### Requirement: Search Result Selection
Selecting a dropdown result SHALL open that card's detail modal directly.

#### Scenario: Click opens card
- **WHEN** a user clicks a card row in the dropdown
- **THEN** that card's detail modal SHALL open

#### Scenario: Enter opens highlighted card
- **WHEN** a user presses Enter while a result is keyboard-highlighted in the dropdown
- **THEN** that card's detail modal SHALL open

### Requirement: Search Dropdown Keyboard Navigation
The search dropdown SHALL support arrow-key navigation between results and a two-stage Escape: the first press closes the dropdown while preserving the search text and in-place filter, and a second press clears the search text entirely.

#### Scenario: Arrow keys move selection
- **WHEN** the dropdown is open and the user presses the down or up arrow key
- **THEN** the highlighted result SHALL move to the next or previous row respectively

#### Scenario: First Escape closes dropdown only
- **WHEN** the dropdown is open and the user presses Escape
- **THEN** the dropdown SHALL close, the search text SHALL remain in the search box, and in-place list filtering SHALL remain active

#### Scenario: Second Escape clears search
- **WHEN** the dropdown is already closed and the user presses Escape again while the search box has text
- **THEN** the search text SHALL be cleared and in-place filtering SHALL be removed
