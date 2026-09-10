import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';
import { compileString } from 'sass-embedded';

const classNames = {
  calendar: {
    wrapper: 'calendarWrapper',
    toolbar: 'calendarToolbar',
    navigation: 'calendarNavigation',
    periodLabel: 'calendarPeriodLabel',
    weekdays: 'calendarWeekdays',
    weekday: 'calendarWeekday',
    grid: 'calendarGrid',
    gridMonth: 'calendarGridMonth',
    gridWeek: 'calendarGridWeek',
  },
  dayCell: {
    wrapper: 'dayCell',
    wrapperOutside: 'dayCellOutside',
    header: 'dayCellHeader',
    dayNumber: 'dayCellNumber',
    dayNumberToday: 'dayCellNumberToday',
    entries: 'dayCellEntries',
    moreButton: 'dayCellMoreButton',
  },
  cardEntry: {
    wrapper: 'cardEntry',
    wrapperCompleted: 'cardEntryCompleted',
    icon: 'cardEntryIcon',
    name: 'cardEntryName',
  },
};

const scopeClasses = (source, names) =>
  Object.entries(names)
    .sort(([left], [right]) => right.length - left.length)
    .reduce(
      (result, [originalName, scopedName]) =>
        result.replaceAll(`.${originalName}`, `.${scopedName}`),
      source.replace(':global(#app)', '#calendar-test'),
    );

const loadCalendarStyles = async () => {
  const [calendarSource, dayCellSource, cardEntrySource] = await Promise.all([
    readFile(path.join(__dirname, 'CalendarView.module.scss'), 'utf8'),
    readFile(path.join(__dirname, 'DayCell.module.scss'), 'utf8'),
    readFile(path.join(__dirname, 'CardEntry.module.scss'), 'utf8'),
  ]);

  return compileString(
    [
      '* { box-sizing: border-box; }',
      scopeClasses(calendarSource, classNames.calendar),
      scopeClasses(dayCellSource, classNames.dayCell),
      scopeClasses(cardEntrySource, classNames.cardEntry),
    ].join('\n'),
  ).css;
};

let browser;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser.close();
});

it('does not let a long card title widen a calendar day column', async () => {
  const styles = await loadCalendarStyles();
  const longTitle =
    'A deliberately very long card title that must truncate instead of resizing a calendar column';
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  await page.setContent(`
    <style>${styles}</style>
    <div id="calendar-test">
      <main class="calendarWrapper">
        <div class="calendarGrid calendarGridMonth">
          ${Array.from(
            { length: 7 },
            (_, index) => `
              <section class="dayCell">
                <div class="dayCellEntries">
                  <a class="cardEntry"><span class="cardEntryName">${
                    index === 6 ? longTitle : 'Short title'
                  }</span></a>
                </div>
              </section>`,
          ).join('')}
        </div>
      </main>
    </div>
  `);

  const layout = await page.evaluate(function evaluateCalendarLayout() {
    const grid = document.querySelector('.calendarGrid').getBoundingClientRect();
    const cells = Array.from(document.querySelectorAll('.dayCell')).map(function mapCell(cell) {
      return cell.getBoundingClientRect();
    });

    return {
      gridRight: grid.right,
      widths: cells.map((cell) => cell.width),
      lastCellRight: cells[cells.length - 1].right,
    };
  });

  await page.close();

  expect(Math.max(...layout.widths) - Math.min(...layout.widths)).toBeLessThanOrEqual(1);
  expect(layout.lastCellRight).toBeLessThanOrEqual(layout.gridRight + 1);
});
