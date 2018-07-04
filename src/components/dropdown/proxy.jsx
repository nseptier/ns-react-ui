import React, { Component } from 'react';
import { bool, string } from 'prop-types';

export default DecoratedComponent => class DropdownProxy extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    align: 'top left',
    anchor: 'bottom left',
    isExpanded: null,
    isFloating: false,
  }

  static propTypes = {
    align: string,
    anchor: string,
    isExpanded: bool,
    isFloating: bool,
    triggerId: string.isRequired,
  }

  // lifecycle -----------------------------------------------------------------

  constructor(props, context) {
    super(props, context);
    this.state = { bottom: null, left: null, right: null, top: null };
  }

  componentDidMount() {
    this.triggerNode = document.getElementById(this.props.triggerId);
    if (this.props.isExpanded) this.positionDropdown();
    document.addEventListener('scroll', this.onScroll);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isExpanded && this.props.isExpanded) this.positionDropdown();
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.onScroll);
  }

  // utils ---------------------------------------------------------------------

  positionDropdown() {
    const { align, anchor, isFloating } = this.props;
    const [yAlign, xAlign] = align.split(' ');
    const [yAnchor, xAnchor] = anchor.split(' ');
    const parentNode = (isFloating
      ? document.body
      : this.triggerNode.parentNode).getBoundingClientRect();
    const trigger = this.triggerNode.getBoundingClientRect();

    this.setState({
      [xAlign]: `${Math.abs(parentNode[xAlign] - trigger[xAnchor])}px`,
      [yAlign]: `${Math.abs(parentNode[yAlign] - trigger[yAnchor])}px`,
    });
  }

  // rendering -----------------------------------------------------------------

  render() {
    const { style, ...props } = this.props;
    const { bottom, left, right, top } = this.state;

    return (bottom === null && top === null)
      || (left === null && right === null)
      ? null
      : (
        <DecoratedComponent
          {...props}
          style={{ ...style, bottom, left, right, top }}
        />
      );
  }
};
