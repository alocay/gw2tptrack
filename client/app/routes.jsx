var React = require('react');
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;

var App = require('./containers/App');
var Market = require('./containers/Market');
var Orders = require('./containers/Orders');

module.exports = (
  <Route component={App}>
    <Route path="/">
      <IndexRoute component={Market} />
      <Route path="orders" component={Orders} />
    </Route>
  </Route>
);
