var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classnames = require('classnames');
var moment = require('moment');
var defaultFormat = 'YYYY-MM-DD';

var DatePicker = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    propName: React.PropTypes.string.isRequired,
    change: React.PropTypes.func.isRequired,
    className: React.PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {
      editing: false,
      value: null
    };
  },

  componentDidMount: function componentDidMount() {
    this.setState({ value: moment(this.props.value).isValid() ? moment(this.props.value).format(defaultFormat) : null });
  },

  handleClick: function handleClick() {
    this.setState({ editing: true });
  },

  handleDateChange: function handleDateChange(e) {
    this.setState({ value: e.target.value });
  },

  handleBlur: function handleBlur(e) {
    this.setState({
      editing: false,
      value: e.target.value
    });

    if (this.props.change)
      this.props.change({ [this.props.propName]: e.target.value });
  },

  render: function render() {
    var dateValue = this.state.value ? moment(this.state.value).format(defaultFormat) : null;
    var textValue = dateValue || '--';
    var picker = this.state.editing ?
      <input type="date" onBlur={this.handleBlur} onChange={this.handleDateChange} value={dateValue || moment().format(defaultFormat)} autoFocus /> :
      <span className={classnames({ [this.props.className]: true })} onClick={this.handleClick}>
        {textValue}
      </span>;

    return picker;
  }
});

module.exports = DatePicker;
