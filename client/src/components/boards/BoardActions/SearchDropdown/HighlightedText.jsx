/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import styles from './HighlightedText.module.scss';

const HighlightedText = React.memo(({ text, start, length }) => {
  if (!length) {
    return text;
  }

  return (
    <>
      {text.slice(0, start)}
      <mark className={styles.mark}>{text.slice(start, start + length)}</mark>
      {text.slice(start + length)}
    </>
  );
});

HighlightedText.propTypes = {
  text: PropTypes.string.isRequired,
  start: PropTypes.number,
  length: PropTypes.number,
};

HighlightedText.defaultProps = {
  start: 0,
  length: 0,
};

export default HighlightedText;
