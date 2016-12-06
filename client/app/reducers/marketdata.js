var types = require('../constants/ActionTypes');
var Immutable = require('immutable');

const initialState = Immutable.fromJS({
  loading: false,
  error: false,
  data: null,
  lastrequest: null
});

module.exports = function itemtypes(state = initialState, action) {
  switch(action.type) {
    case types.FETCH_ITEMS_DATA_REQUEST: {
      return state.set('loading', true);
    }
    case types.FETCH_ITEMS_DATA_COMPLETE: {
      return state.set('loading', false).set('lastrequest', Date.now());
    }
    case types.FETCH_ITEMS_DATA_ERROR: {
      return state.set('error', true).set('loading', false);
    }
    case types.SET_ITEMS_DATA: {
      return state.set('data', Immutable.fromJS(action.data));
    }
    default: {
      return state;
    }
  }
}
