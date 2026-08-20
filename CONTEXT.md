# Planka

Kanban board app. Projects contain Boards; Boards contain Lists (optionally grouped into Swimlanes); Lists contain Cards.

## Language

**Board Search**:
The single search input on a board that drives two independent outputs from the same typed text — List Filtering and Search Dropdown.

**List Filtering**:
Narrowing which cards are shown within each list on the current board view, in place, without navigating away. Only affects lists currently rendered on screen.
_Avoid_: search filter, card filter (ambiguous with Board Search itself)

**Search Dropdown**:
An overlay beneath the Board Search input listing matching cards from the entire board — every list and swimlane — regardless of what's currently scrolled into view.
_Avoid_: search results, typeahead

**Custom Field**:
A named, free-text field a board or card can define, holding a single string value (Custom Field Value) per card. Has no data type — no number/checkbox/date distinction, everything is text.
_Avoid_: field type, custom property

**Custom Field Group**:
A named collection of Custom Fields, defined either on a Board (as a reusable template applied to cards) or directly on a Card.

**Active List / Closed List**:
The two list states that make a card part of the "live" board — visible, filterable, and reachable by Board Search.

**Archive List / Trash List**:
The two list states that remove a card from the live board. Cards here are excluded from Board Search entirely and are not loaded with the rest of a board's data.
_Avoid_: deleted card, for Archive List (archived cards are recoverable, not deleted)
