/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import Paths from '../../../../constants/Paths';

import styles from './CardEntry.module.scss';

const CardEntry = React.memo(({ id }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const card = useSelector((state) => selectCardById(state, id));

  return (
    <Link
      to={Paths.CARDS.replace(':id', id)}
      className={classNames(styles.wrapper, card.isDueCompleted && styles.wrapperCompleted)}
    >
      {card.isDueCompleted && <Icon name="checkmark" size="small" className={styles.icon} />}
      <span className={styles.name}>{card.name}</span>
    </Link>
  );
});

CardEntry.propTypes = {
  id: PropTypes.string.isRequired,
};

export default CardEntry;
