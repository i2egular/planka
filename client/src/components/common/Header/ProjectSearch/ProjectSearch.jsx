/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import debounce from 'lodash/debounce';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../../lib/hooks';
import { push } from '../../../../lib/redux-router';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import { useNestedRef } from '../../../../hooks';
import Paths from '../../../../constants/Paths';
import api from '../../../../api';
import buildProjectSearchResults from '../../../../utils/build-project-search-results';
import SearchDropdown from '../../../boards/BoardActions/SearchDropdown';

import styles from './ProjectSearch.module.scss';

const SEARCH_MIN_LENGTH_FOR_DROPDOWN = 2;
const SEARCH_RESULTS_PAGE_SIZE = 8;

const ProjectSearch = React.memo(() => {
  const project = useSelector(selectors.selectCurrentProject);
  const accessToken = useSelector(selectors.selectAccessToken);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [visibleResultsCount, setVisibleResultsCount] = useState(SEARCH_RESULTS_PAGE_SIZE);
  const [searchResults, setSearchResults] = useState([]);

  const requestIdRef = useRef(0);

  const visibleSearchResults = useMemo(
    () => searchResults.slice(0, visibleResultsCount),
    [searchResults, visibleResultsCount],
  );

  const isDropdownVisible =
    isSearchFocused && isDropdownOpen && search.trim().length >= SEARCH_MIN_LENGTH_FOR_DROPDOWN;

  const searchWrapperRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);

  useLayoutEffect(() => {
    if (!isDropdownVisible || !searchWrapperRef.current) {
      setDropdownPosition(null);
      return undefined;
    }

    const updateDropdownPosition = () => {
      const rect = searchWrapperRef.current.getBoundingClientRect();

      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    };

    updateDropdownPosition();

    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isDropdownVisible]);

  const fetchResults = useCallback(
    async (projectId, nextSearch) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (!nextSearch.trim()) {
        setSearchResults([]);
        return;
      }

      let body;
      try {
        body = await api.getCardsInProject(
          projectId,
          {
            search: nextSearch,
          },
          {
            Authorization: `Bearer ${accessToken}`,
          },
        );
      } catch {
        return;
      }

      if (requestIdRef.current !== requestId) {
        return;
      }

      const boardsById = body.included.boards.reduce(
        (result, board) => ({
          ...result,
          [board.id]: board,
        }),
        {},
      );

      const listsById = body.included.lists.reduce(
        (result, list) => ({
          ...result,
          [list.id]: list,
        }),
        {},
      );

      setSearchResults(buildProjectSearchResults(body.items, boardsById, listsById, nextSearch));
    },
    [accessToken],
  );

  const debouncedFetchResults = useMemo(() => debounce(fetchResults, 400), [fetchResults]);

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const cancelSearch = useCallback(() => {
    debouncedFetchResults.cancel();
    setSearch('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    searchFieldRef.current.blur();
  }, [debouncedFetchResults, searchFieldRef]);

  const handleResultSelect = useCallback(
    (cardId) => {
      dispatch(push(Paths.CARDS.replace(':id', cardId)));
      setIsDropdownOpen(false);
      searchFieldRef.current.blur();
    },
    [dispatch, searchFieldRef],
  );

  const handleLoadMoreResultsClick = useCallback(() => {
    setVisibleResultsCount((count) => count + SEARCH_RESULTS_PAGE_SIZE);
  }, []);

  const handleSearchChange = useCallback(
    (_, { value }) => {
      setSearch(value);
      setActiveResultIndex(-1);
      setVisibleResultsCount(SEARCH_RESULTS_PAGE_SIZE);
      debouncedFetchResults(project.id, value);
      setIsDropdownOpen(value.trim().length >= SEARCH_MIN_LENGTH_FOR_DROPDOWN);
    },
    [project, debouncedFetchResults],
  );

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);

    if (search.trim().length >= SEARCH_MIN_LENGTH_FOR_DROPDOWN) {
      setIsDropdownOpen(true);
    }
  }, [search]);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          cancelSearch();
        }

        return;
      }

      if (!isDropdownVisible || visibleSearchResults.length === 0) {
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveResultIndex((index) => (index + 1) % visibleSearchResults.length);

          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveResultIndex((index) =>
            index <= 0 ? visibleSearchResults.length - 1 : index - 1,
          );

          break;
        case 'Enter':
          if (activeResultIndex >= 0 && activeResultIndex < visibleSearchResults.length) {
            event.preventDefault();
            handleResultSelect(visibleSearchResults[activeResultIndex].id);
          }

          break;
        default:
      }
    },
    [
      cancelSearch,
      isDropdownOpen,
      isDropdownVisible,
      visibleSearchResults,
      activeResultIndex,
      handleResultSelect,
    ],
  );

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleCancelSearchClick = useCallback(() => {
    cancelSearch();
  }, [cancelSearch]);

  useDidUpdate(() => {
    setSearch('');
    setSearchResults([]);
    setActiveResultIndex(-1);
    setVisibleResultsCount(SEARCH_RESULTS_PAGE_SIZE);
  }, [project && project.id]);

  if (!project) {
    return null;
  }

  const isSearchActive = search || isSearchFocused;

  return (
    <div className={styles.wrapper}>
      <span ref={searchWrapperRef} className={styles.searchWrapper}>
        <Input
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchCardsInProject')}
          maxLength={128}
          icon={
            isSearchActive ? (
              <Icon link name="cancel" onClick={handleCancelSearchClick} />
            ) : (
              'search'
            )
          }
          className={classNames(styles.search, !isSearchActive && styles.searchInactive)}
          onFocus={handleSearchFocus}
          onKeyDown={handleSearchKeyDown}
          onChange={handleSearchChange}
          onBlur={handleSearchBlur}
        />
        {isDropdownVisible && (
          <SearchDropdown
            position={dropdownPosition}
            results={visibleSearchResults}
            hasMore={searchResults.length > visibleResultsCount}
            activeIndex={activeResultIndex}
            onResultSelect={handleResultSelect}
            onResultHover={setActiveResultIndex}
            onLoadMore={handleLoadMoreResultsClick}
          />
        )}
      </span>
    </div>
  );
});

export default ProjectSearch;
