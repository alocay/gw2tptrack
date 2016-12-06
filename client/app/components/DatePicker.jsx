var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classnames = require('classnames');
var squaresGif = require('../../assets/squares.gif');

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
    this.setState({ value: this.props.value.concat('') });
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
    var picker = this.state.editing ?
      <input type="date" onBlur={this.handleBlur} onChange={this.handleDateChange} value={this.state.value} autoFocus /> :
      <span className={classnames({ [this.props.className]: true })} onClick={this.handleClick}>
        {this.props.value}
      </span>;

    return picker;
  }
});

module.exports = DatePicker;
