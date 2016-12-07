var React = require('react');
var Navbar = require('../components/Navbar');
var DevTools = require('./DevTools.jsx');

var App = React.createClass({
  render: function render() {
    var devTools = process.env.NODE_ENV === 'production' ? null : <DevTools />
    return (
      <div>
        <Navbar />
        <div className="container">
          {devTools}
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = App
