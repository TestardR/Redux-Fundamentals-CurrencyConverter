import { createStore } from 'redux';

// state
var defaultState = {
  originAmount: '0.00'
};

// reducer
function amount(state = defaultState, action) {
  console.log('state', state);
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
var store = createStore(amount);

export default store;
