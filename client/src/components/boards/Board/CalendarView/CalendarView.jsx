/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import i18n from 'i18next';
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';
import addMonths from 'date-fns/addMonths';
import addWeeks from 'date-fns/addWeeks';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';

import { getDueDateKey } from '../../../../utils/group-card-ids-by-due-date';
import DayCell from './DayCell';

import styles from './CalendarView.module.scss';

const Granularities = {
  WEEK: 'week',
  MONTH: 'month',
};

const MAX_VISIBLE_ENTRIES_BY_GRANULARITY = {
  [Granularities.WEEK]: 8,
  [Granularities.MONTH]: 3,
};

const EMPTY_CARD_IDS = [];

const CalendarView = React.memo(({ cardIdsByDate }) => {
  const [t] = useTranslation();
  const [granularity, setGranularity] = useState(Granularities.MONTH);
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const locale = i18n.dateFns.getLocale();

  const { periodStart, periodEnd } = useMemo(() => {
    if (granularity === Granularities.WEEK) {
      return {
        periodStart: startOfWeek(anchorDate, { locale }),
        periodEnd: endOfWeek(anchorDate, { locale }),
      };
    }

    return {
      periodStart: startOfWeek(startOfMonth(anchorDate), { locale }),
      periodEnd: endOfWeek(endOfMonth(anchorDate), { locale }),
    };
  }, [granularity, anchorDate, locale]);

  const days = useMemo(
    () => eachDayOfInterval({ start: periodStart, end: periodEnd }),
    [periodStart, periodEnd],
  );

  const weekdayLabels = useMemo(
    () =>
      days.slice(0, 7).map((date) =>
        t('format:weekdayShort', {
          value: date,
          postProcess: 'formatDate',
        }),
      ),
    [days, t],
  );

  const handlePrevClick = useCallback(() => {
    setAnchorDate((currentDate) =>
      granularity === Granularities.WEEK ? addWeeks(currentDate, -1) : addMonths(currentDate, -1),
    );
  }, [granularity]);

  const handleNextClick = useCallback(() => {
    setAnchorDate((currentDate) =>
      granularity === Granularities.WEEK ? addWeeks(currentDate, 1) : addMonths(currentDate, 1),
    );
  }, [granularity]);

  const handleTodayClick = useCallback(() => {
    setAnchorDate(new Date());
  }, []);

  const handleWeekGranularityClick = useCallback(() => {
    setGranularity(Granularities.WEEK);
  }, []);

  const handleMonthGranularityClick = useCallback(() => {
    setGranularity(Granularities.MONTH);
  }, []);

  const periodLabel =
    granularity === Granularities.MONTH
      ? t('format:monthAndYear', {
          value: anchorDate,
          postProcess: 'formatDate',
        })
      : `${t('format:longDate', {
          value: periodStart,
          postProcess: 'formatDate',
        })} – ${t('format:fullDate', {
          value: periodEnd,
          postProcess: 'formatDate',
        })}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.navigation}>
          <Button.Group>
            <Button type="button" icon onClick={handlePrevClick}>
              <Icon fitted name="chevron left" />
            </Button>
            <Button type="button" onClick={handleTodayClick}>
              {t('common.today')}
            </Button>
            <Button type="button" icon onClick={handleNextClick}>
              <Icon fitted name="chevron right" />
            </Button>
          </Button.Group>
          <span className={styles.periodLabel}>{periodLabel}</span>
        </div>
        <Button.Group>
          <Button
            type="button"
            active={granularity === Granularities.WEEK}
            onClick={handleWeekGranularityClick}
          >
            {t('common.week')}
          </Button>
          <Button
            type="button"
            active={granularity === Granularities.MONTH}
            onClick={handleMonthGranularityClick}
          >
            {t('common.month')}
          </Button>
        </Button.Group>
      </div>
      <div className={styles.weekdays}>
        {weekdayLabels.map((label, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.weekday}>
            {label}
          </div>
        ))}
      </div>
      <div
        className={classNames(
          styles.grid,
          granularity === Granularities.WEEK ? styles.gridWeek : styles.gridMonth,
        )}
      >
        {days.map((date) => (
          <DayCell
            key={date.toISOString()}
            date={date}
            cardIds={cardIdsByDate[getDueDateKey(date)] || EMPTY_CARD_IDS}
            isCurrentPeriod={granularity === Granularities.WEEK || isSameMonth(date, anchorDate)}
            isToday={isSameDay(date, new Date())}
            maxVisibleEntries={MAX_VISIBLE_ENTRIES_BY_GRANULARITY[granularity]}
          />
        ))}
      </div>
    </div>
  );
});

CalendarView.propTypes = {
  cardIdsByDate: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default CalendarView;
