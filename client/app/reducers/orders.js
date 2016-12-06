var types = require('../constants/ActionTypes');
var Immutable = require('immutable');

const initialState = Immutable.fromJS({
  loading: false,
  error: false,
  data: null,
  lastrequest: null,
  updating: false
});

module.exports = function itemtypes(state = initialState, action) {
  switch(action.type) {
    case types.POST_NEW_ORDER_REQUEST: {
      return state.set('loading', true);
    }
    case types.POST_NEW_ORDER_COMPLETE: {
      return state.set('loading', false).set('lastrequest', Date.now());
    }
    case types.POST_NEW_ORDER_ERROR: {
      return state.set('error', true).set('loading', false);
    }
    case types.SET_ORDERS: {
      return state.set('data', Immutable.fromJS(action.data));
    }
    case types.ADD_ORDER: {
      return state.set('data', state.get('data').push(Immutable.fromJS(action.data)));
    }
    case types.POST_ORDERS_UPDATE_REQUEST: {
      return state.set('updating', true);
    }
    case types.POST_ORDERS_UPDATE_COMPLETE: {
      return state.set('updating', false);
    }
    case types.POST_ORDERS_UPDATE_ERROR: {
      return state.set('error', true).set('updating', false);
    }
    case types.UPDATE_ORDERS: {
      return state.set('data', state.get('data').mergeDeep(action.data));
    }
    default: {
      return state;
    }
  }
}
