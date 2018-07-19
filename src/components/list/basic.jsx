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
  const groups = source.groupBy(item => item.get(groupBy));

  return (
    <div className={classNames('ns-list', className)} style={style}>
      {groups.keySeq()
        .sort((a, b) => (b === null) - (a === null) || +(a > b) || -(a < b))
        .map(name => (
          <div className="ns-list__group" key={name}>
            {!!groupHeaderRenderer &&
              <header className="ns-list__header">
                {groupHeaderRenderer(name)}
              </header>
            }
            <ul className="ns-list__items">
              {groups.get(name)
                .sort(sortBy ? sortByFn(sortBy.key, sortBy) : () => 0)
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
        ))
      }
    </div>
  );
};

list.defaultProps = {
  groupBy: null,
  groupHeaderRenderer: null,
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
