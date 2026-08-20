/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import buildSearchParts from './build-search-parts';

export const CardSearchMatchFields = {
  NAME: 'name',
  DESCRIPTION: 'description',
  CUSTOM_FIELD: 'customField',
};

const buildRegex = (pattern) => {
  try {
    return new RegExp(pattern, 'i');
  } catch {
    return null;
  }
};

const includesSearchPart = (value, searchPart) =>
  !!value && value.toLowerCase().includes(searchPart);

const findMatchInValue = (value, search) => {
  if (!value) {
    return null;
  }

  if (search.startsWith('/')) {
    const regex = buildRegex(search.slice(1));

    if (!regex) {
      return null;
    }

    const match = value.match(regex);
    return match ? { index: match.index, length: match[0].length } : null;
  }

  const searchParts = buildSearchParts(search);
  const lowerValue = value.toLowerCase();

  return searchParts.reduce((result, searchPart) => {
    const index = lowerValue.indexOf(searchPart);

    if (index === -1) {
      return result;
    }

    if (!result || index < result.index) {
      return { index, length: searchPart.length };
    }

    return result;
  }, null);
};

/**
 * @param {{cardModel: object}} cardModel A redux-orm Card model instance
 * @returns {{name: string, content: string|null}[]}
 */
export const getCardCustomFieldsForSearch = (cardModel) =>
  cardModel.customFieldValues.toModelArray().map((customFieldValueModel) => ({
    name: customFieldValueModel.customField.name,
    content: customFieldValueModel.content,
  }));

/**
 * @param {{name: string, description: string|null, customFields: {name: string, content: string|null}[]}} card
 * @param {string} search
 */
export const cardTextMatchesSearch = (card, search) => {
  if (!search) {
    return true;
  }

  if (search.startsWith('/')) {
    const regex = buildRegex(search.slice(1));

    if (!regex) {
      return false;
    }

    return (
      regex.test(card.name) ||
      (card.description && regex.test(card.description)) ||
      card.customFields.some(
        ({ name, content }) => regex.test(name) || (content && regex.test(content)),
      )
    );
  }

  const searchParts = buildSearchParts(search);

  return searchParts.every(
    (searchPart) =>
      includesSearchPart(card.name, searchPart) ||
      includesSearchPart(card.description, searchPart) ||
      card.customFields.some(
        ({ name, content }) =>
          includesSearchPart(name, searchPart) || includesSearchPart(content, searchPart),
      ),
  );
};

/**
 * Finds the first field that matches, in priority order: name, description,
 * then custom fields (by field name or content). Falls back to an
 * unhighlighted name match when the card only qualifies via tokens spread
 * across multiple fields (no single field contains every token).
 *
 * @param {{name: string, description: string|null, customFields: {name: string, content: string|null}[]}} card
 * @param {string} search
 */
export const findCardSearchMatch = (card, search) => {
  if (!search || !cardTextMatchesSearch(card, search)) {
    return null;
  }

  const nameMatch = findMatchInValue(card.name, search);

  if (nameMatch) {
    return {
      field: CardSearchMatchFields.NAME,
      value: card.name,
      match: nameMatch,
    };
  }

  const descriptionMatch = findMatchInValue(card.description, search);

  if (descriptionMatch) {
    return {
      field: CardSearchMatchFields.DESCRIPTION,
      value: card.description,
      match: descriptionMatch,
    };
  }

  const customFieldMatch = card.customFields.reduce((result, customField) => {
    if (result) {
      return result;
    }

    const nameFieldMatch = findMatchInValue(customField.name, search);
    const contentMatch = findMatchInValue(customField.content, search);

    if (!nameFieldMatch && !contentMatch) {
      return null;
    }

    const value = customField.content
      ? `${customField.name}: ${customField.content}`
      : customField.name;

    return {
      field: CardSearchMatchFields.CUSTOM_FIELD,
      customFieldName: customField.name,
      value,
      match: contentMatch
        ? { index: contentMatch.index + customField.name.length + 2, length: contentMatch.length }
        : nameFieldMatch,
    };
  }, null);

  if (customFieldMatch) {
    return customFieldMatch;
  }

  return {
    field: CardSearchMatchFields.NAME,
    value: card.name,
    match: null,
  };
};

/**
 * Builds a short excerpt of `value` centered on `match`, with the highlight
 * position adjusted for the excerpt's own coordinates.
 */
export const buildSearchSnippet = (value, match, contextLength = 40) => {
  if (!match) {
    return {
      text: value,
      highlightStart: 0,
      highlightLength: 0,
    };
  }

  const start = Math.max(0, match.index - contextLength);
  const end = Math.min(value.length, match.index + match.length + contextLength);

  const prefix = start > 0 ? '…' : '';
  const suffix = end < value.length ? '…' : '';

  return {
    text: `${prefix}${value.slice(start, end)}${suffix}`,
    highlightStart: match.index - start + prefix.length,
    highlightLength: match.length,
  };
};
