/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CardEntry from './CardEntry';

import styles from './DayCell.module.scss';

const DayCell = React.memo(({ date, cardIds, isCurrentPeriod, isToday, maxVisibleEntries }) => {
  const [t] = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMoreClick = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const hiddenCount = cardIds.length - maxVisibleEntries;
  const visibleCardIds =
    isExpanded || hiddenCount <= 0 ? cardIds : cardIds.slice(0, maxVisibleEntries);

  return (
    <div className={classNames(styles.wrapper, !isCurrentPeriod && styles.wrapperOutside)}>
      <div className={styles.header}>
        <span className={classNames(styles.dayNumber, isToday && styles.dayNumberToday)}>
          {t('format:dayOfMonth', {
            value: date,
            postProcess: 'formatDate',
          })}
        </span>
      </div>
      <div className={styles.entries}>
        {visibleCardIds.map((cardId) => (
          <CardEntry key={cardId} id={cardId} />
        ))}
        {!isExpanded && hiddenCount > 0 && (
          <button type="button" className={styles.moreButton} onClick={handleMoreClick}>
            {t('common.moreCards', {
              count: hiddenCount,
            })}
          </button>
        )}
      </div>
    </div>
  );
});

DayCell.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCurrentPeriod: PropTypes.bool.isRequired,
  isToday: PropTypes.bool.isRequired,
  maxVisibleEntries: PropTypes.number.isRequired,
};

export default DayCell;
