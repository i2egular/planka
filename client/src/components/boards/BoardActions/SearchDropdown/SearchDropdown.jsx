/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import { CardSearchMatchFields } from '../../../../utils/card-search';
import HighlightedText from './HighlightedText';

import styles from './SearchDropdown.module.scss';

const SearchDropdown = React.memo(
  ({ position, results, hasMore, activeIndex, onResultSelect, onResultHover, onLoadMore }) => {
    const [t] = useTranslation();

    const handleMouseDown = useCallback((event) => {
      // Keep the search input focused when clicking inside the dropdown,
      // otherwise the blur event would close it before the click registers.
      event.preventDefault();
    }, []);

    if (!position) {
      return null;
    }

    return createPortal(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={styles.wrapper}
        style={{ top: position.top, left: position.left, width: position.width }}
        onMouseDown={handleMouseDown}
      >
        {results.length === 0 ? (
          <div className={styles.empty}>{t('common.noCardsFound')}</div>
        ) : (
          <>
            <ul className={styles.list} role="listbox">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={classNames(styles.item, index === activeIndex && styles.itemActive)}
                    onMouseEnter={() => onResultHover(index)}
                    onClick={() => onResultSelect(result.id)}
                  >
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>
                        {result.field === CardSearchMatchFields.NAME ? (
                          <HighlightedText
                            text={result.name}
                            start={result.nameMatch ? result.nameMatch.index : 0}
                            length={result.nameMatch ? result.nameMatch.length : 0}
                          />
                        ) : (
                          result.name
                        )}
                      </span>
                      <span className={styles.itemList}>
                        <Icon fitted name="list" size="small" className={styles.itemListIcon} />
                        {result.listName}
                      </span>
                    </div>
                    {result.snippet && (
                      <div className={styles.itemSnippet}>
                        <HighlightedText
                          text={result.snippet.text}
                          start={result.snippet.highlightStart}
                          length={result.snippet.highlightLength}
                        />
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            {hasMore && (
              <button type="button" className={styles.loadMore} onClick={onLoadMore}>
                {t('common.loadMoreResults')}
              </button>
            )}
          </>
        )}
      </div>,
      document.body,
    );
  },
);

SearchDropdown.propTypes = {
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }),
  /* eslint-disable react/forbid-prop-types */
  results: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  hasMore: PropTypes.bool.isRequired,
  activeIndex: PropTypes.number.isRequired,
  onResultSelect: PropTypes.func.isRequired,
  onResultHover: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
};

SearchDropdown.defaultProps = {
  position: null,
};

export default SearchDropdown;
