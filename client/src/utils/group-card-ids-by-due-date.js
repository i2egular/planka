/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const pad = (number) => String(number).padStart(2, '0');

export const getDueDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const groupCardIdsByDueDate = (cards) => {
  const cardsWithDueDate = cards.filter((card) => card.dueDate);

  cardsWithDueDate.sort((cardLeft, cardRight) => cardLeft.dueDate - cardRight.dueDate);

  const result = {};

  cardsWithDueDate.forEach((card) => {
    const key = getDueDateKey(card.dueDate);

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(card.id);
  });

  return result;
};

export default groupCardIdsByDueDate;
