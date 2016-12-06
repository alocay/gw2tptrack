var React = require('react');
var DevTools = require('./DevTools.jsx');

var App = React.createClass({
  render: function render() {
    var devTools = process.env.NODE_ENV === 'production' ? null : <DevTools />
    return (
      <div className="container">
        {devTools}
        {this.props.children}
      </div>
    );
  }
});

module.exports = App
