var createStore = require('redux').createStore;
var combineReducers = require('redux').combineReducers;
var compose = require('redux').compose;
var applyMiddleware = require('redux').applyMiddleware;
var thunk = require('redux-thunk').default;
var DevTools = require('../containers/DevTools');
var persistState = require('redux-devtools').persistState;
var reducer = require('../reducers');

var enhancer = compose(
  applyMiddleware(thunk),
  DevTools.instrument(),
  persistState(getDebugSessionKey())
);

function getDebugSessionKey() {
    var matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
    return (matches && matches.length > 0) ? matches[1] : null;
}

var configureStore = function configureStore(initialState) {
    var store = createStore(reducer, initialState, enhancer);

    if (module.hot) {
        module.hot.accept('../reducers', () =>
            store.replaceReducer(require('../reducers').default)
        );

        //// Enable Webpack hot module replacement for reducers
        //module.hot.accept('../reducers', () => {
        //    var nextReducer = require('../reducers/index').default;
        //    store.replaceReducer(nextReducer);
        //});
    }

    return store;
}

module.exports = configureStore;
