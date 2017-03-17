import classNames from 'utils/classnames';
import PropTypes from 'prop-types';
import React from 'react';
import './styles.scss';

const importAll = r => r.keys().map(r);
importAll(require.context('../../../images/icons/', false, /\.svg$/));

const icon = ({ className, name, style }) => (
  <svg className={classNames('ns-icon', className)} style={style}>
    <use xlinkHref={`#${name}`} />
  </svg>
);

icon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default icon;
