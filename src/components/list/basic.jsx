import classNames from 'utils/classnames';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import './styles.scss';

const list = ({ className, itemIdentifier, itemRenderer, source, style }) => (
  <div className={classNames('ns-list', className)} style={style}>
    <ul className="ns-list__items">
      {source.map((item, index) => (
        <li
          className="ns-list__item"
          key={item.get('id') || itemIdentifier(item) || index}
        >
          {itemRenderer(item)}
        </li>
      ))}
    </ul>
  </div>
);

list.defaultProps = {
  itemIdentifier: () => null,
};

list.propTypes = {
  itemIdentifier: PropTypes.func,
  itemRenderer: PropTypes.func.isRequired,
  source: PropTypes.instanceOf(Immutable.List).isRequired,
};

export default list;
