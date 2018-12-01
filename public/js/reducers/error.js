import { ActionTypes as types } from '../constants';

var defaultState = {
  errorMsg: ''
};

function error(state = defaultState, action) {
  switch (action.type) {
    case 'RECEIVED_[AJAX_CALL]_FAILURE':
      return {
        ...state,
        errorMsg: action.data.msg
      };
    case 'RECEIVED_FEES_SUCCESS':
      return {
        ...state,
        errorMsg: ''
      };
    default:
      return state;
  }
}

export default error;
