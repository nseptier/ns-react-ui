import React, { Component } from 'react';
import { bool, string } from 'prop-types';

export default DecoratedComponent => class DropdownProxy extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    align: 'top left',
    anchor: 'bottom left',
    isExpanded: null,
  }

  static propTypes = {
    align: string,
    anchor: string,
    isExpanded: bool,
    triggerId: string.isRequired,
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
