import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bool, func, string } from 'prop-types';
import Proxy from './proxy';
import './styles.scss';

@Proxy
export default class Dropdown extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    isExpanded: null,
  }

  static propTypes = {
    isExpanded: bool,
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

  @autobind
  onFocusOut(event) {
    const { isExpanded, onClose } = this.props;

    if (!isExpanded
      || document.activeElement === event.target
      || this.dropdownNode.contains(event.relatedTarget)) {
      return;
    }
    onClose();
  }

  @autobind
  onKeyDown(event) {
    if (event.keyCode !== 27) return;
    this.props.onClose();
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

  // rendering -----------------------------------------------------------------

  renderPortal() {
    const { children, className, isExpanded, style } = this.props;

    return (
      <div
        aria-hidden={!isExpanded}
        className={classNames('ns-dropdown', className)}
        ref={(node) => { this.dropdownNode = node; }}
        style={style}
      >
        {children}
      </div>
    );
  }

  render() {
    return this.state.isExpanded
      ? ReactDOM.createPortal(
        this.renderPortal(),
        document.body,
      )
      : null;
  }
}
