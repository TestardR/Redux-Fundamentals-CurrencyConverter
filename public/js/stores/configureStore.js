import { applyMiddleware, createStore } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

// state
var defaultState = {
  originAmount: '0.00'
};

// reducer
function amount(state = defaultState, action) {
  if (action.type === 'CHANGE_ORIGIN_AMOUNT') {
    // dont mutate the state, instead use Object.assign
    // return Object.assign({}, state, { originAmount: action.data });
    // same thing
    return {
      ...state,
      originAmount: action.data.newAmount
    };
  }
  return state;
}

// Reduxstore (dataStore where the state is saved)
var store = createStore(amount, applyMiddleware(logger));

export default store;
