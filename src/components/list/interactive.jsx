import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import Immutable from 'immutable';
import List from 'components/list';
import modulo from 'utils/modulo';
import React, { cloneElement, Component } from 'react';
import sortByFn from 'utils/immutable/sort-by';
import {
  arrayOf, bool, func, instanceOf, number, shape, string,
} from 'prop-types';
import './styles.scss';

const sortSource = ({ groupBy, sortBy, source }) => {
  let sortedSource = source;

  if (sortBy) {
    const { key, nullFirst, order } = sortBy;
    sortedSource = sortedSource.sort(sortByFn(key, { nullFirst, order }));
  }
  if (groupBy) {
    sortedSource = sortedSource.sort(sortByFn(groupBy, { nullFirst: true }));
  }

  return sortedSource.toList();
};

export default class InteractiveList extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    activeItems: null,
    focusTarget: null,
    groupBy: undefined,
    groupHeaderRenderer: undefined,
    hoveredItem: null,
    itemDisabler: () => null,
    onItemHover: () => null,
    onItemSelection: () => null,
    selectionKeys: [13],
    sortBy: null,
  }

  static propTypes = {
    activeItems: instanceOf(Immutable.Iterable),
    focusTarget: string,
    groupBy: string,
    groupHeaderRenderer: func,
    hoveredItem: instanceOf(Immutable.Map),
    itemDisabler: func,
    itemRenderer: func.isRequired,
    onItemHover: func,
    onItemSelection: func,
    selectionKeys: arrayOf(number),
    sortBy: shape({
      key: string.isRequired,
      nullFirst: bool,
      order: string,
    }),
    source: instanceOf(Immutable.Iterable).isRequired,
  }

  // lifecycle -----------------------------------------------------------------

  constructor(props, context) {
    const { activeItems, hoveredItem, source } = props;
    const sortedSource = sortSource(props);
    const item = hoveredItem || sortedSource.find(i => activeItems.includes(i));

    super(props, context);
    this.state = {
      hoveredItem: source.includes(item) ? item : sortedSource.first(),
      sortedSource,
    };
  }

  componentDidMount() {
    const { focusTarget, onItemHover } = this.props;
    const { hoveredItem } = this.state;

    if (focusTarget) {
      document.getElementById(focusTarget)
        .addEventListener('keydown', this.onKeyDown);
    }
    this.focusItem(hoveredItem, true);
    onItemHover(hoveredItem);
  }

  componentWillReceiveProps(nextProps) {
    const { source } = this.props;

    if (nextProps.hoveredItem
      && this.props.hoveredItem
      && !this.props.hoveredItem.equals(nextProps.hoveredItem)) {
      this.setState({ hoveredItem: nextProps.hoveredItem });
    }

    if (!source.equals(nextProps.source)) {
      const sortedSource = sortSource(nextProps);

      this.setState({
        hoveredItem: nextProps.source.includes(this.state.hoveredItem)
          ? this.state.hoveredItem
          : sortedSource.first(),
        sortedSource,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { hoveredItem, onItemHover, source } = this.props;

    if (!source.equals(prevProps.source)) {
      const option = source.includes(this.state.hoveredItem)
        ? this.state.hoveredItem
        : this.state.sortedSource.first();

      this.focusItem(option);
    }

    if (this.state.hoveredItem !== prevState.hoveredItem) {
      onItemHover(this.state.hoveredItem);
    }

    if (hoveredItem
      && hoveredItem.equals(this.state.hoveredItem)
      && this.state.hoveredItem
      && !this.state.hoveredItem.equals(prevState.hoveredItem)) {
      this.focusItem(hoveredItem);
    }
  }

  componentWillUnmount() {
    const { focusTarget } = this.props;
    const focusNode = document.getElementById(focusTarget);

    if (focusTarget && focusNode) {
      focusNode.removeEventListener('keydown', this.onKeyDown);
    }
  }

  // callbacks -----------------------------------------------------------------

  @autobind
  onItemSelection(event) {
    const { itemDisabler, onItemSelection, source } = this.props;
    const { hoveredItem } = this.state;

    if (!hoveredItem
      || !source.includes(hoveredItem)
      || itemDisabler(hoveredItem)) {
      return;
    }
    onItemSelection(hoveredItem, event);
  }

  @autobind
  onKeyDown(event) {
    const [NEXT, PREVIOUS] = [1, -1];

    if (this.props.selectionKeys.includes(event.keyCode)) {
      event.preventDefault();
      this.onItemSelection(event);
    }

    switch (event.keyCode) {
      case 38: // up arrow
        event.preventDefault();
        this.focusAdjacentItem(PREVIOUS);
        break;

      case 40: // down arrow
        event.preventDefault();
        this.focusAdjacentItem(NEXT);
        break;

      default:
    }
  }

  // utils ---------------------------------------------------------------------

  focusAdjacentItem(direction) {
    const { sortedSource } = this.state;
    const adjacentIndex = modulo(
      sortedSource.indexOf(this.state.hoveredItem) + direction,
      sortedSource.size,
    );
    const hoveredItem = sortedSource.get(adjacentIndex);

    this.setState({ hoveredItem });
    this.focusItem(hoveredItem);
  }

  focusItem(item, shouldCenter) {
    const index = this.state.sortedSource.indexOf(item);
    const node = this.listNode.querySelectorAll('[data-menuitem]')[index];

    /* this could be a simple matter of calling `node.focus()`, but the list's
       behavior can be weird for some browsers, depending on whether the focused
       item is outside the scroll view or at least partially visible */
    if (node) this.scrollToNode(node, shouldCenter);
  }

  scrollToNode(node, shouldCenter) {
    const dropdown = {
      height: this.listNode.clientHeight,
      scroll: this.listNode.scrollTop,
      visibleTop: this.listNode.clientHeight + this.listNode.scrollTop,
    };
    const item = {
      bottom: node.offsetTop + node.clientHeight,
      height: node.clientHeight,
      top: node.offsetTop,
    };

    if (shouldCenter) {
      this.listNode.scrollTop = item.top
        - (dropdown.height / 2)
        + (item.height / 2);
    } else {
      if (item.bottom > dropdown.visibleTop) {
        this.listNode.scrollTop = item.bottom - dropdown.height;
      }
      if (item.top < dropdown.scroll) {
        this.listNode.scrollTop = item.bottom >= dropdown.scroll
          ? item.top
          : item.bottom - dropdown.height;
      }
    }
  }

  // render --------------------------------------------------------------------

  renderItem(item) {
    const {
      activeItems, itemDisabler, itemRenderer, onItemSelection,
    } = this.props;
    const { hoveredItem } = this.state;
    const renderedItem = itemRenderer(item);
    const isDisabled = !!itemDisabler(item);

    return cloneElement(
      renderedItem,
      {
        ...item.props,
        className: classNames(
          'ns-list--interactive__item',
          renderedItem.props.className,
        ),
        'data-active': activeItems.includes(item),
        'data-hover': item.equals(hoveredItem),
        'data-menuitem': true,
        disabled: isDisabled,
        onClick: event => (isDisabled || onItemSelection(item, event)),
        onMouseEnter: () => this.setState({ hoveredItem: item }),
        tabIndex: -1,
      },
    );
  }

  render() {
    const {
      className, groupBy, groupHeaderRenderer, source, sortBy, style,
    } = this.props;

    return (
      <div
        className={classNames('ns-list--interactive', className)}
        ref={(node) => { this.listNode = node; }}
        style={style}
      >
        <List
          groupBy={groupBy}
          groupHeaderRenderer={groupHeaderRenderer}
          itemRenderer={item => this.renderItem(item)}
          sortBy={sortBy}
          source={source}
        />
      </div>
    );
  }
}
