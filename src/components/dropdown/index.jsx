import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import modulo from 'utils/modulo';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bool, func, string } from 'prop-types';
import Proxy from './proxy';
import './styles.scss';

const FIELDS = ['button', 'input', 'object', 'select', 'textarea'];
const LINKS = ['a', 'area'];

const isVisibleNode = node => !!(node.offsetWidth
  || node.offsetHeight
  || node.getClientRects().length);

const selectors = `${FIELDS}, ${LINKS}, [tabindex]`;
const findFocusableNodes = (parentNode = document) =>
  [...parentNode.querySelectorAll(selectors)]
    .filter((node) => {
      const nodeName = node.nodeName.toLowerCase();
      const tabIndex = parseInt(node.getAttribute('tabIndex'), 10);
      const hasTabIndex = !Number.isNaN(tabIndex) && (tabIndex >= 0);
      let isFocusable;

      if (FIELDS.includes(nodeName)) {
        isFocusable = !node.disabled
          && (Number.isNaN(tabIndex) || tabIndex >= 0);
      } else if (LINKS.includes(nodeName)) {
        isFocusable = !!node.href || hasTabIndex;
      } else {
        isFocusable = hasTabIndex;
      }

      let isVisible = true;
      let n = node;
      while (n && n !== document && isVisible) {
        isVisible = isVisibleNode(n);
        n = n.parentNode;
      }
      return isFocusable && isVisible;
    });

@Proxy
export default class Dropdown extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    isExpanded: null,
    isFloating: false,
  }

  static propTypes = {
    isExpanded: bool,
    isFloating: bool,
    onClose: func.isRequired,
    triggerId: string.isRequired,
  }

  // lifecycle -----------------------------------------------------------------

  constructor(props, context) {
    super(props, context);
    this.state = { isExpanded: props.isExpanded };
  }

  componentDidMount() {
    this.triggerNode = document.getElementById(this.props.triggerId);

    this.triggerNode.addEventListener('focusout', this.onFocusOut);
    this.triggerNode.addEventListener('keydown', this.onKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    const { isExpanded } = this.props;

    if (!isExpanded && nextProps.isExpanded) {
      clearTimeout(this.timeoutId);
      this.setState({ isExpanded: true });
    } else if (isExpanded && !nextProps.isExpanded) {
      this.timeoutId = setTimeout(
        () => this.setState({ isExpanded: false }),
        this.getAnimationDuration() * 1000,
      );
      if (this.triggerNode.contains(document.activeElement)
        || this.dropdownNode.contains(document.activeElement)) {
        this.triggerNode.focus();
      }
    }
  }

  componentWillUnmount() {
    this.triggerNode.removeEventListener('keydown', this.onFocusOut);
    this.triggerNode.removeEventListener('keydown', this.onKeyDown);
  }

  // callbacks -----------------------------------------------------------------

  onClose() {
    this.triggerNode.focus();
    this.props.onClose();
  }

  @autobind
  onFocusOut(event) {
    const { isExpanded, onClose } = this.props;

    if (!isExpanded
      || document.activeElement === event.target
      || event.relatedTarget === this.triggerNode
      || !this.dropdownNode
      || (this.dropdownNode
        && this.dropdownNode.contains(event.relatedTarget))) {
      return;
    }
    onClose();
  }

  @autobind
  onKeyDown(event) {
    if (event.keyCode === 9 && this.dropdownNode) this.focusNextElement(event);
    if (event.keyCode === 27) this.onClose();
  }

  // getters -------------------------------------------------------------------

  getAnimationDuration() {
    return this.dropdownNode
      ? parseFloat(
        getComputedStyle(this.dropdownNode).animationDuration,
        10,
      )
      : null;
  }

  // utils ---------------------------------------------------------------------

  focusNextElement(event) {
    const dropdownNodes = findFocusableNodes(this.dropdownNode);
    const pageNodes = findFocusableNodes(document)
      .filter(node => !dropdownNodes.includes(node));
    const index = modulo(
      pageNodes.indexOf(this.triggerNode) + 1,
      pageNodes.length,
    );

    if (document.activeElement === dropdownNodes[0] && event.shiftKey) {
      event.preventDefault();
      this.triggerNode.focus();
    }
    if (document.activeElement === dropdownNodes.pop() && !event.shiftKey) {
      event.preventDefault();
      pageNodes[index].focus();
    }
  }

  // rendering -----------------------------------------------------------------

  renderDropdown() {
    const { children, className, isExpanded, style } = this.props;

    return (
      /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
      <div
        aria-hidden={!isExpanded}
        className={classNames('ns-dropdown', className)}
        onBlur={this.onFocusOut}
        onKeyDown={this.onKeyDown}
        ref={(node) => { this.dropdownNode = node; }}
        role="dialog"
        style={style}
        tabIndex="-1"
      >
        {children}
      </div>
      /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
    );
  }

  render() {
    const { isFloating, triggerId } = this.props;

    if (!this.state.isExpanded) return null;
    return ReactDOM.createPortal(
      this.renderDropdown(),
      isFloating ? document.body : document.getElementById(triggerId).parentNode,
    );
  }
}
