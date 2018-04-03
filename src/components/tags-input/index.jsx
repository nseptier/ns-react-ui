import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import Dropdown from 'components/dropdown';
import Icon from 'components/icon';
import Immutable from 'immutable';
import List from 'components/list';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class TagsInput extends Component {
  // static --------------------------------------------------------------------

  static defaultProps = {
    disabled: false,
    isExpanded: false,
    optionDisabler: () => null,
    value: Immutable.OrderedSet(),
  }

  static propTypes = {
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    isExpanded: PropTypes.bool,
    onTagAdding: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onTagRemoval: PropTypes.func.isRequired,
    onOptionSelection: PropTypes.func.isRequired,
    optionDisabler: PropTypes.func,
    optionRenderer: PropTypes.func.isRequired,
    options: PropTypes.instanceOf(Immutable.OrderedSet).isRequired,
    tagRenderer: PropTypes.func.isRequired,
    value: PropTypes.instanceOf(Immutable.Set),
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
  onTagAdding(string) {
    if (this.props.onTagAdding(string)) {
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
  onTagRemoval(string) {
    this.props.onTagRemoval(string);
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
          id={`${id}AutocompleteLisbox`}
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
    const { disabled, id } = this.props;
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
          aria-owns={`${id}AutocompleteLisbox`}
          role="combobox"
        />
        {/* eslint-enable */}
        <input
          aria-activedescendant={(isExpanded && hoveredOption)
            ? hoveredOption.get('id')
            : null
          }
          aria-autocomplete="list"
          aria-controls={`${id}AutocompleteLisbox`}
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
          role="searchbox"
          value={inputValue}
        />
      </Fragment>
    );
  }

  renderTags() {
    const { disabled, tagRenderer, value } = this.props;

    return value.map(string => (
      <div className="tag tags-input__tag" key={string}>
        {tagRenderer(string)}
        {!disabled &&
          <button
            className="tag__icon"
            onClick={() => this.onTagRemoval(string)}
            tabIndex="-1"
          >
            <Icon name="close" />
          </button>
        }
      </div>
    ));
  }

  render() {
    return (
      <Fragment>
        <div
          className={classNames('tags-input', this.props.className)}
          id={this.props.id}
        >
          {this.renderTags()}
          {this.renderSearchInput()}
          {this.renderOptionsDropdown()}
        </div>
      </Fragment>
    );
  }
}
