import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

// state
var defaultState = {
  originAmount: '0.00',
  destinationAmount: '0.00',
  conversionRate: 1.5
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
  } else if (action.type === 'RECEIVED_CONVERSION_RATE') {
    return {
      ...state,
      conversionRate: action.data.xRate,
      destinationAmount: action.data.destAmount
    };
  }

  return state;
}

var logger = createLogger({
  collapsed: true
});

// Reduxstore (dataStore where the state is saved)
var store = createStore(amount, applyMiddleware(thunk, logger));

export default store;
