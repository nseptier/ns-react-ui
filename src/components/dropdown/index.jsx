import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './styles.scss';

const proxy = DecoratedComponent => class DropdownProxy extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    align: 'top left',
    anchor: 'bottom left',
    isExpanded: null,
  }

  static propTypes = {
    align: PropTypes.string,
    anchor: PropTypes.string,
    isExpanded: PropTypes.bool,
    triggerId: PropTypes.string.isRequired,
  }

  // lifecycle -----------------------------------------------------------------

  constructor(props, context) {
    super(props, context);
    this.state = { bottom: null, left: null, right: null, top: null };
  }

  componentDidMount() {
    this.triggerNode = document.getElementById(this.props.triggerId);
    if (this.props.isExpanded) this.setPosition();
  }

  componentDidUpdate(prevProps) {
    /* a second render is necessary once the DOM has been updated to be able to
       use the nodes' dimensions and position */
    if (!prevProps.isExpanded && this.props.isExpanded) this.setPosition();
  }

  // getters -------------------------------------------------------------------

  setPosition() {
    const { align, anchor } = this.props;
    const [yAlign, xAlign] = align.split(' ');
    const [yAnchor, xAnchor] = anchor.split(' ');
    const trigger = this.triggerNode.getBoundingClientRect();
    const viewport = {
      bottom: document.documentElement.clientHeight,
      left: 0,
      right: document.documentElement.clientWidth,
      top: 0,
    };

    this.setState({
      [xAlign]: `${Math.abs(viewport[xAlign] - trigger[xAnchor])}px`,
      [yAlign]: `${Math.abs(viewport[yAlign] - trigger[yAnchor])}px`,
    });
  }

  // rendering -----------------------------------------------------------------

  render() {
    const { style, ...props } = this.props;
    const { bottom, left, right, top } = this.state;

    return (bottom === null && top === null) || (left === null && right === null)
      ? null
      : (
        <DecoratedComponent
          {...props}
          style={{ ...style, bottom, left, right, top }}
        />
      );
  }
};

@proxy // eslint-disable-line react/no-multi-comp
export default class Dropdown extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    isExpanded: null,
  }

  static propTypes = {
    isExpanded: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    triggerId: PropTypes.string.isRequired,
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
