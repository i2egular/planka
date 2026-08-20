import {
  CardSearchMatchFields,
  buildSearchSnippet,
  cardTextMatchesSearch,
  findCardSearchMatch,
} from './card-search';

const buildCard = (overrides) => ({
  name: 'Fix login bug',
  description: 'Users cannot log in with SSO',
  customFields: [{ name: 'Priority', content: 'Urgent' }],
  ...overrides,
});

describe('cardTextMatchesSearch', () => {
  test('matches by name', () => {
    expect(cardTextMatchesSearch(buildCard(), 'login')).toBeTruthy();
  });

  test('matches by description', () => {
    expect(cardTextMatchesSearch(buildCard(), 'sso')).toBeTruthy();
  });

  test('matches by custom field name', () => {
    expect(cardTextMatchesSearch(buildCard(), 'priority')).toBeTruthy();
  });

  test('matches by custom field content', () => {
    expect(cardTextMatchesSearch(buildCard(), 'urgent')).toBeTruthy();
  });

  test('requires every token to be found, possibly across different fields', () => {
    expect(cardTextMatchesSearch(buildCard(), 'login urgent')).toBeTruthy();
    expect(cardTextMatchesSearch(buildCard(), 'login nonexistent')).toBeFalsy();
  });

  test('supports regex mode', () => {
    expect(cardTextMatchesSearch(buildCard(), '/^Fix')).toBeTruthy();
    expect(cardTextMatchesSearch(buildCard(), '/^bug')).toBeFalsy();
  });

  test('treats an invalid regex as no match', () => {
    expect(cardTextMatchesSearch(buildCard(), '/(/')).toBeFalsy();
  });

  test('empty search matches everything', () => {
    expect(cardTextMatchesSearch(buildCard(), '')).toBeTruthy();
  });
});

describe('findCardSearchMatch', () => {
  test('prioritizes name over description and custom fields', () => {
    const match = findCardSearchMatch(buildCard({ description: 'login issue' }), 'login');
    expect(match.field).toBe(CardSearchMatchFields.NAME);
  });

  test('falls back to description when name does not match', () => {
    const match = findCardSearchMatch(buildCard(), 'sso');
    expect(match.field).toBe(CardSearchMatchFields.DESCRIPTION);
  });

  test('falls back to a custom field when only it matches', () => {
    const match = findCardSearchMatch(buildCard(), 'urgent');
    expect(match.field).toBe(CardSearchMatchFields.CUSTOM_FIELD);
    expect(match.customFieldName).toBe('Priority');
    expect(match.value).toBe('Priority: Urgent');
  });

  test('returns null when nothing matches', () => {
    expect(findCardSearchMatch(buildCard(), 'nonexistent')).toBeNull();
  });

  test('prefers name even when the qualifying tokens are spread across fields', () => {
    const match = findCardSearchMatch(buildCard(), 'login urgent');
    expect(match.field).toBe(CardSearchMatchFields.NAME);
    expect(match.match).toEqual({ index: 4, length: 5 });
  });
});

describe('buildSearchSnippet', () => {
  test('returns the full value unhighlighted when there is no match', () => {
    expect(buildSearchSnippet('Hello world', null)).toEqual({
      text: 'Hello world',
      highlightStart: 0,
      highlightLength: 0,
    });
  });

  test('truncates long values around the match with ellipses', () => {
    const value = `${'a'.repeat(60)}needle${'b'.repeat(60)}`;
    const snippet = buildSearchSnippet(value, { index: 60, length: 6 }, 10);

    expect(snippet.text.startsWith('…')).toBeTruthy();
    expect(snippet.text.endsWith('…')).toBeTruthy();
    expect(
      snippet.text.slice(snippet.highlightStart, snippet.highlightStart + snippet.highlightLength),
    ).toBe('needle');
  });
});
