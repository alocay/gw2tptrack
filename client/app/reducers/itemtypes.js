var types = require('../constants/ActionTypes');
var Immutable = require('immutable');

const initialState = null;

module.exports = function itemtypes(state = initialState, action) {
  switch(action.type) {
    case types.SET_TYPES: {
      return Immutable.fromJS(action.data);
    }
    default: {
      return state;
    }
  }
}
