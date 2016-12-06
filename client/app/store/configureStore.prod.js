var reducer = require('../reducers');
var createStore = require('redux').createStore;
var applyMiddleware = require('redux').applyMiddleware;
var thunk = require('redux-thunk').default;

var configureStore = function configureStore(initialState) {
	return createStore(reducer, applyMiddleware(thunk), initialState);
}

module.exports = configureStore;
