import groupCardIdsByDueDate, { getDueDateKey } from './group-card-ids-by-due-date';

const buildCard = (overrides) => ({
  id: 'card-1',
  dueDate: null,
  ...overrides,
});

describe('getDueDateKey', () => {
  test('formats a date as yyyy-MM-dd, zero-padded', () => {
    expect(getDueDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('groupCardIdsByDueDate', () => {
  test('excludes cards with no due date', () => {
    const cards = [buildCard({ id: 'no-date', dueDate: null })];

    expect(groupCardIdsByDueDate(cards)).toEqual({});
  });

  test('buckets a card under its due date', () => {
    const cards = [buildCard({ id: 'card-1', dueDate: new Date(2026, 0, 5, 9) })];

    expect(groupCardIdsByDueDate(cards)).toEqual({
      '2026-01-05': ['card-1'],
    });
  });

  test('orders same-day cards by due time, earliest first', () => {
    const cards = [
      buildCard({ id: 'afternoon', dueDate: new Date(2026, 0, 5, 15) }),
      buildCard({ id: 'morning', dueDate: new Date(2026, 0, 5, 9) }),
    ];

    expect(groupCardIdsByDueDate(cards)).toEqual({
      '2026-01-05': ['morning', 'afternoon'],
    });
  });

  test('buckets cards spanning multiple months separately', () => {
    const cards = [
      buildCard({ id: 'january', dueDate: new Date(2026, 0, 31) }),
      buildCard({ id: 'february', dueDate: new Date(2026, 1, 1) }),
    ];

    expect(groupCardIdsByDueDate(cards)).toEqual({
      '2026-01-31': ['january'],
      '2026-02-01': ['february'],
    });
  });
});
