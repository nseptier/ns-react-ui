import PropTypes from 'prop-types';
import React from 'react';
import BasicList from './basic';
import InteractiveList from './interactive';

const List = ({ isInteractive, ...props }) => (
  isInteractive
    ? <InteractiveList {...props} />
    : <BasicList {...props} />
);

List.defaultProps = {
  isInteractive: false,
};

List.propTypes = {
  isInteractive: PropTypes.bool,
};

export default List;
