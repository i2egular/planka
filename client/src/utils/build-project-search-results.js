/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { CardSearchMatchFields, buildSearchSnippet, findCardSearchMatch } from './card-search';

/**
 * Ranks and annotates raw (non-normalized) cards returned by the
 * project-wide search endpoint, mirroring `selectSearchResultsForCurrentBoard`
 * but operating on plain API records instead of redux-orm models.
 *
 * @param {object[]} cards
 * @param {object} boardsById
 * @param {object} listsById
 * @param {string} search
 */
export default (cards, boardsById, listsById, search) => {
  if (!search) {
    return [];
  }

  const resultsByField = {
    [CardSearchMatchFields.NAME]: [],
    [CardSearchMatchFields.DESCRIPTION]: [],
  };

  cards.forEach((card) => {
    const match = findCardSearchMatch(
      {
        name: card.name,
        description: card.description,
        customFields: [],
      },
      search,
    );

    if (!match) {
      return;
    }

    const board = boardsById[card.boardId];
    const list = listsById[card.listId];

    resultsByField[match.field].push({
      id: card.id,
      name: card.name,
      boardId: card.boardId,
      boardName: board ? board.name : '',
      listId: card.listId,
      listName: list ? list.name : '',
      field: match.field,
      nameMatch: match.field === CardSearchMatchFields.NAME ? match.match : null,
      snippet:
        match.field === CardSearchMatchFields.NAME
          ? null
          : buildSearchSnippet(match.value, match.match),
    });
  });

  return [
    ...resultsByField[CardSearchMatchFields.NAME],
    ...resultsByField[CardSearchMatchFields.DESCRIPTION],
  ];
};
