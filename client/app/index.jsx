require('../css/skeleton.css');
require('../css/style.scss');

var React = require('react');
var ReactDOM = require('react-dom');
var Provider = require('react-redux').Provider;
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var browserHistory = require('react-router').browserHistory;
var syncHistoryWithStore = require('react-router-redux').syncHistoryWithStore;
var routes = require('./routes.jsx');
var configureStore = require('./store/configureStore');
var App = require('./containers/App.jsx');
var DevTools = require('./containers/DevTools.jsx');
var store = configureStore({});

// Create an enhanced history that syncs navigation events with the store
var history = syncHistoryWithStore(browserHistory, store);

//<Router history={history} routes={routes} />
ReactDOM.render(
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('root')
);
