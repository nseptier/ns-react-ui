import classNames from 'utils/classnames';
import Immutable from 'immutable';
import React from 'react';
import sortByFn from 'utils/immutable/sort-by';
import { bool, func, instanceOf, shape, string } from 'prop-types';
import './styles.scss';

const list = ({
  className, groupBy, groupHeaderRenderer, itemIdentifier, itemRenderer, sortBy,
  source, style,
}) => (
  <div className={classNames('ns-list', className)} style={style}>
    {source
      .groupBy(item => item.get(groupBy))
      .sort((a, b) => (b === '') - (a === '') || +(a > b) || -(a < b))
      .map((group, name) => (
        /* eslint-disable react/no-array-index-key */
        /* We are looping through an Immutable Map so those are names, rather
           than indexes, so keys will stay consistent. */
        <div className="ns-list__group" key={name}>
          {!!groupHeaderRenderer &&
            <header className="ns-list__header">
              {groupHeaderRenderer(name)}
            </header>
          }
          <ul className="ns-list__items">
            {group
              .sortBy(sortBy ? sortByFn(sortBy) : undefined)
              .map((item, index) => (
                <li
                  className="ns-list__item"
                  key={item.get('id') || itemIdentifier(item) || index}
                >
                  {itemRenderer(item)}
                </li>
              ))
            }
          </ul>
        </div>
        /* eslint-enable */
      ))
    }
  </div>
);

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
  itemRenderer: func.isRequired, // eslint-disable-line react/no-typos
  source: instanceOf(Immutable.Iterable).isRequired,
  sortBy: shape({
    key: string.isRequired,
    nullFirst: bool,
    order: string,
  }),
};

export default list;
