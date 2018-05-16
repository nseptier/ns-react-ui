import classNames from 'utils/classnames';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import './styles.scss';

const list = ({ className, itemRenderer, source, style }) => (
  <div className={classNames('ns-list', className)} style={style}>
    <ul className="ns-list__items">
      {source.map((item, index) => (
        <li
          className="ns-list__item"
          key={itemRenderer ? (item.get('id') || index) : item}
        >
          {itemRenderer ? itemRenderer(item) : item}
        </li>
      ))}
    </ul>
  </div>
);

list.defaultProps = {
  itemRenderer: null,
};

list.propTypes = {
  itemRenderer: PropTypes.func,
  source: PropTypes.instanceOf(Immutable.List).isRequired,
};

export default list;
