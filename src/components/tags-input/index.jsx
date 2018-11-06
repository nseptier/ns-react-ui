import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import Dropdown from 'components/dropdown';
import Icon from 'components/icon';
import Immutable from 'immutable';
import List from 'components/list';
import React, { Component, Fragment } from 'react';
import { bool, func, instanceOf, string } from 'prop-types';

export default class TagsInput extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    disabled: false,
    isExpanded: false,
    optionDisabler: () => null,
    placeholder: null,
    value: Immutable.OrderedSet(),
  }

  static propTypes = {
    disabled: bool,
    id: string.isRequired,
    isExpanded: bool,
    onChange: func.isRequired,
    onOptionSelection: func.isRequired,
    onTagAdding: func.isRequired,
    onTagRemoval: func.isRequired,
    optionDisabler: func,
    optionRenderer: func.isRequired,
    options: instanceOf(Immutable.OrderedSet).isRequired,
    placeholder: string,
    tagRenderer: func.isRequired,
    value: instanceOf(Immutable.Set),
  }

  // lifecycle -----------------------------------------------------------------

  constructor(props, context) {
    super(props, context);
    this.state = {
      hoveredOption: null,
      inputValue: '',
      isExpanded: props.isExpanded,
    };
  }

  // callbacks -----------------------------------------------------------------

  @autobind
  onTagAdding(text) {
    if (this.props.onTagAdding(text)) {
      this.setState({ inputValue: '', isExpanded: false });
    }
  }

  @autobind
  onChange(event) {
    this.setState({
      inputValue: event.target.value,
      isExpanded: !!event.target.value.length,
    });
    this.props.onChange(event.target.value);
  }

  @autobind
  onTagRemoval(text) {
    this.props.onTagRemoval(text);
  }

  @autobind
  onKeyDown(event) {
    const { value } = this.props;
    const { inputValue } = this.state;

    switch (event.keyCode) {
      case 8:
        if (!inputValue) this.onTagRemoval(value.last());
        break;

      case 9:
        if (!inputValue) break;
        event.preventDefault();
        this.onTagAdding(inputValue);
        break;

      case 13:
      case 186:
      case 188:
        event.preventDefault();
        this.onTagAdding(inputValue);
        break;

      default:
    }
  }

  @autobind
  onOptionSelection(option, event) {
    event.stopPropagation();
    this.setState({ inputValue: '', isExpanded: false });
    this.props.onOptionSelection(option);
  }

  // rendering -----------------------------------------------------------------

  renderOption(option) {
    const { hoveredOption, inputValue } = this.state;

    return (
      <div
        aria-selected={option.equals(hoveredOption)}
        id={option.get('id')}
        role="option"
      >
        {this.props.optionRenderer(option, inputValue)}
      </div>
    );
  }

  renderOptionsDropdown() {
    const { id, options, optionDisabler } = this.props;

    return (
      <Dropdown
        className="tags-input__dropdown"
        isExpanded={this.state.isExpanded && !!options.size}
        onClose={() => this.setState({ isExpanded: false })}
        triggerId={`${id}AutocompleteInput`}
      >
        <List
          focusTarget={`${id}AutocompleteInput`}
          id={`${id}AutocompleteListbox`}
          isInteractive
          itemRenderer={option => this.renderOption(option)}
          itemDisabler={optionDisabler}
          onItemHover={option => this.setState({ hoveredOption: option })}
          onItemSelection={this.onOptionSelection}
          role="listbox"
          selectionKeys={[9, 13, 186, 188]}
          source={options.toList()}
          triggerId={`${id}AutocompleteInput`}
        />
      </Dropdown>
    );
  }

  renderSearchInput() {
    const { disabled, id, placeholder } = this.props;
    const { hoveredOption, inputValue, isExpanded } = this.state;

    return (
      <Fragment>
        {/* In a combobox implementing the ARIA 1.1 pattern:
              • When the combobox popup is visible, the textbox element has
                aria-controls set to a value that refers to the combobox popup
                element.
            (https://www.w3.org/TR/wai-aria-1.1/#combobox) */}
        {/* eslint-disable jsx-a11y/role-has-required-aria-props */}
        <span
          aria-expanded={isExpanded}
          aria-haspopup
          aria-owns={`${id}AutocompleteListbox`}
          role="combobox"
        />
        {/* eslint-enable */}
        <input
          aria-activedescendant={(isExpanded && hoveredOption)
            ? hoveredOption.get('id')
            : null
          }
          aria-autocomplete="list"
          aria-controls={`${id}AutocompleteListbox`}
          autoComplete="off"
          className="tags-input__search"
          disabled={disabled}
          id={`${id}AutocompleteInput`}
          onChange={this.onChange}
          onFocus={(event) => {
            event.persist();
            setTimeout(
              () => event.target.value && this.setState({ isExpanded: true }),
              0,
            );
          }}
          onKeyDown={this.onKeyDown}
          placeholder={placeholder}
          role="searchbox"
          value={inputValue}
        />
      </Fragment>
    );
  }

  renderTags() {
    const { disabled, tagRenderer, value } = this.props;

    return value.map(text => (
      <div className="tag tags-input__tag" key={text}>
        {tagRenderer(text)}
        {!disabled &&
          <button
            className="tag__icon"
            onClick={() => this.onTagRemoval(text)}
            tabIndex="-1"
          >
            <Icon name="close" />
          </button>
        }
      </div>
    ));
  }

  render() {
    const { className, style } = this.props;

    return (
      <Fragment>
        <div
          className={classNames('tags-input', className)}
          id={this.props.id}
          style={style}
        >
          {this.renderTags()}
          {this.renderSearchInput()}
          {this.renderOptionsDropdown()}
        </div>
      </Fragment>
    );
  }
}
