import classNames from 'utils/classnames';
import Immutable from 'immutable';
import React from 'react';
import sortByFn from 'utils/immutable/sort-by';
import { bool, func, instanceOf, shape, string } from 'prop-types';
import './styles.scss';

const list = ({
  className, groupBy, groupHeaderRenderer, itemIdentifier, itemRenderer, sortBy,
  source, style,
}) => {
  const groups = source.reduce(
    /* eslint-disable no-param-reassign */
    (accumulator, item) => {
      const groupName = (groupBy && item.get(groupBy)) || '';

      if (!accumulator[groupName]) accumulator[groupName] = [];
      accumulator[groupName].push(item);
      if (sortBy) {
        const { key, nullFirst, order } = sortBy;
        accumulator[groupName].sort(sortByFn(key, { nullFirst, order }));
      }
      return accumulator;
    },
    /* eslint-enable */
    {},
  );
  const groupsNames = Object.keys(groups)
    .sort((a, b) => (b === '') - (a === '') || +(a > b) || -(a < b));

  return (
    <div className={classNames('ns-list', className)} style={style}>
      {groupsNames.map(name => (
        <div className="ns-list__group" key={name}>
          {!!groupHeaderRenderer &&
            <header className="ns-list__header">
              {groupHeaderRenderer(name)}
            </header>
          }
          <ul className="ns-list__items">
            {groups[name].map((item, index) => (
              <li
                className="ns-list__item"
                key={item.get('id') || itemIdentifier(item) || index}
              >
                {itemRenderer(item)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

list.defaultProps = {
  groupBy: null,
  groupHeaderRenderer: groupName => groupName,
  itemIdentifier: () => null,
  sortBy: null,
};

list.propTypes = {
  groupBy: string,
  groupHeaderRenderer: func,
  itemIdentifier: func,
  itemRenderer: func.isRequired,
  source: instanceOf(Immutable.Iterable).isRequired,
  sortBy: shape({
    key: string.isRequired,
    nullFirst: bool,
    order: string,
  }),
};

export default list;
