var combineReducers = require('redux').combineReducers;
var routerReducer = require('react-router-redux').routerReducer;
var itemtypes = require('./itemtypes');
var items = require('./items');
var marketdata = require('./marketdata');
var orders = require('./orders');

module.exports = combineReducers({
  items: items,
  itemtypes: itemtypes,
  marketdata: marketdata,
  orders: orders,
  routing: routerReducer
});
