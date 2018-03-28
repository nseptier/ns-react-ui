import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import Immutable from 'immutable';
import List from 'components/list';
import modulo from 'utils/modulo';
import PropTypes from 'prop-types';
import React, { cloneElement, Component } from 'react';
import './styles.scss';

export default class InteractiveList extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    activeItem: null,
    focusTarget: null,
    hoveredItem: null,
    itemDisabler: () => null,
    onItemHover: () => null,
    onItemSelection: () => null,
    selectionKeys: [13],
  }

  static propTypes = {
    activeItem: PropTypes.node,
    focusTarget: PropTypes.string,
    hoveredItem: PropTypes.node,
    itemDisabler: PropTypes.func,
    itemRenderer: PropTypes.func.isRequired,
    onItemHover: PropTypes.func,
    onItemSelection: PropTypes.func,
    selectionKeys: PropTypes.arrayOf(PropTypes.number),
    source: PropTypes.instanceOf(Immutable.List).isRequired,
  }

  // lifecycle -----------------------------------------------------------------

  constructor(props, context) {
    const { activeItem, hoveredItem, source } = props;
    const item = hoveredItem || activeItem;

    super(props, context);
    this.state = {
      hoveredItem: source.includes(item) ? item : source.first(),
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
      this.setState({
        hoveredItem: nextProps.source.includes(this.state.hoveredItem)
          ? this.state.hoveredItem
          : nextProps.source.first(),
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { hoveredItem, onItemHover, source } = this.props;

    if (!source.equals(prevProps.source)) {
      const option = source.includes(this.state.hoveredItem)
        ? this.state.hoveredItem
        : source.first();

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
    const { source } = this.props;
    const adjacentIndex = modulo(
      source.indexOf(this.state.hoveredItem) + direction,
      source.size,
    );
    const hoveredItem = source.get(adjacentIndex);

    this.setState({ hoveredItem });
    this.focusItem(hoveredItem);
  }

  focusItem(item, shouldCenter) {
    const index = this.props.source.indexOf(item);
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
        this.listNode.scrollTop = item.top;
      }
    }
  }

  // render --------------------------------------------------------------------

  renderItem(item) {
    const { activeItem, itemDisabler, itemRenderer, onItemSelection }
      = this.props;
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
        'data-active': item.equals(activeItem),
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
    const { className, source, style } = this.props;

    return (
      <div
        className={classNames('interactive-list', className)}
        ref={(node) => { this.listNode = node; }}
        style={style}
      >
        <List
          itemRenderer={item => this.renderItem(item)}
          source={source}
        />
      </div>
    );
  }
}
