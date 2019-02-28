import autobind from 'autobind-decorator';
import classNames from 'utils/classnames';
import Dropdown from 'components/dropdown';
import Icon from 'components/icon';
import Immutable from 'immutable';
import List from 'components/list';
import React, { cloneElement, Component, Fragment } from 'react';
import { bool, func, instanceOf, string } from 'prop-types';
import './styles.scss';

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
      hasFocus: false,
      hoveredOption: null,
      inputValue: '',
      isExpanded: props.isExpanded,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.inputValue !== prevState.inputValue) {
      this.inputNode.style.width = this.state.inputValue
        ? `${this.lenRefNode.getBoundingClientRect().width + 4}px`
        : '1rem';
    }
  }

  // callbacks -----------------------------------------------------------------

  @autobind
  onBlur() {
    const { inputValue } = this.state;

    this.setState({ hasFocus: false });
    this.onTagAdding(inputValue);
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
  onClick() {
    this.inputNode.focus();
  }

  @autobind
  onFocus(event) {
    event.persist();
    this.setState({ hasFocus: true });
    setTimeout(
      () => event.target.value && this.setState({ isExpanded: true }),
      0,
    );
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

  @autobind
  onTagAdding(text) {
    if (this.props.onTagAdding(text)) {
      this.setState({ inputValue: '', isExpanded: false });
    }
  }

  @autobind
  onTagRemoval(text) {
    this.props.onTagRemoval(text);
  }

  // rendering -----------------------------------------------------------------

  renderOption(option) {
    const { hoveredOption, inputValue } = this.state;
    const renderedOption = this.props.optionRenderer(option, inputValue);

    return cloneElement(
      renderedOption,
      {
        'aria-selected': option.equals(hoveredOption),
        id: option.get('id'),
        role: 'option',
      },
    );
  }

  renderOptionsDropdown() {
    const { id, options, optionDisabler } = this.props;

    return (
      <Dropdown
        className="tags-input__dropdown"
        isExpanded={this.state.isExpanded && !!options.size}
        onClose={() => this.setState({ isExpanded: false })}
        style={{ left: 0, top: '100%' }}
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
        <span
          aria-expanded={isExpanded}
          aria-haspopup
          aria-owns={`${id}AutocompleteListbox`}
          /* In a combobox implementing the ARIA 1.1 pattern:
                • When the combobox popup is visible, the textbox element has
                  aria-controls set to a value that refers to the combobox popup
                  element.
              (https://www.w3.org/TR/wai-aria-1.1/#combobox) */
          // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
          role="combobox"
        />
        <div
          className="tags-input__input tags-input__input--fake"
          ref={(node) => { if (node) this.lenRefNode = node; }}
        >
          {inputValue}
        </div>
        <input
          aria-activedescendant={(isExpanded && hoveredOption)
            ? hoveredOption.get('id')
            : null
          }
          aria-autocomplete="list"
          aria-controls={`${id}AutocompleteListbox`}
          autoComplete="off"
          className="tags-input__input"
          disabled={disabled}
          id={`${id}AutocompleteInput`}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onKeyDown={this.onKeyDown}
          placeholder={placeholder}
          ref={(node) => { if (node) this.inputNode = node; }}
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
      /* Since the actua; input is only 1px long, we need to let users clicking
         on the wrapper to focus the component. Users navigation with keyboard
         won't face any issue. */
      // eslint-disable-next-line
      <div
        className={classNames('tags-input', className)}
        data-active={this.state.hasFocus}
        id={this.props.id}
        onClick={this.onClick}
        role="textbox"
        style={style}
      >
        <div className="tags-input__inner-wrap">
          {this.renderTags()}
          {this.renderSearchInput()}
        </div>
        {this.renderOptionsDropdown()}
      </div>
    );
  }
}
