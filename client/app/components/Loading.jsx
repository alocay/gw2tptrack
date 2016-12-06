var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classnames = require('classnames');
var squaresGif = require('../../assets/squares.gif');

var Loading = React.createClass({
  propTypes: {
    enable: React.PropTypes.bool,
    message: React.PropTypes.string
  },

  render: function render() {
    return (
      <div className={classnames({ 'loading-indicator': true, 'enabled': this.props.enable })}>
        {this.props.enable ? <img src={squaresGif} /> : null}
      </div>);
  }
});

module.exports = Loading;
