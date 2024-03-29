import axios from 'axios';
import debounce from 'lodash.debounce';

import { ActionTypes as types } from '../constants';

export function changeOriginAmount(newAmount) {
  return {
    type: types.CHANGE_ORIGIN_AMOUNT,
    data: { newAmount: newAmount }
  };
}

export function changeDestAmount(newAmount) {
  return {
    type: types.CHANGE_DESTINATION_AMOUNT,
    data: { newAmount: newAmount }
  };
}

export function changeOriginCurrency(newCurrency) {
  return {
    type: types.CHANGE_ORIGIN_CURRENCY,
    data: { newCurrency: newCurrency }
  };
}

export function changeDestCurrency(newCurrency) {
  return {
    type: types.CHANGE_DESTINATION_CURRENCY,
    data: { newCurrency: newCurrency }
  };
}

export function fetchConversionRate(payload) {
  return dispatch => {
    makeConversionAjaxCall(payload, dispatch);
  };
}

function _makeConversionAjaxCall(payload, dispatch) {
  dispatch({ type: 'REQUEST_CONVERSION_RATE', data: payload });

  // ajax call for destination amount
  axios
    .get('/api/conversion', {
      params: payload
    })
    .then(resp => {
      dispatch({ type: 'RECEIVED_CONVERSION_RATE_SUCCESS', data: resp.data });
    })
    .catch(err => {
      dispatch({ type: 'RECEIVED_CONVERSION_RATE_FAILURE', data: err });
    });
}

var makeConversionAjaxCall = debounce(_makeConversionAjaxCall, 300);

export function fetchConversionRateAndFees(payload) {
  return dispatch => {
    makeConversionAndFeesAjaxCall(payload, dispatch);
  };
}

function _makeConversionAndFeesAjaxCall(payload, dispatch) {
  dispatch({ type: 'REQUEST_CONVERSION_RATE', data: payload });

  // ajax call for destination amount
  axios
    .get('/api/conversion', {
      params: payload
    })
    .then(resp => {
      dispatch({ type: 'RECEIVED_CONVERSION_RATE_SUCCESS', data: resp.data });

      var feePayload = Object.assign({}, payload, {
        originAmount: resp.data.originAmount
      });
      dispatch(fetchFees(feePayload));
    })
    .catch(err => {
      dispatch({ type: 'RECEIVED_CONVERSION_RATE_FAILURE', data: err });
    });
}

var makeConversionAndFeesAjaxCall = debounce(
  _makeConversionAndFeesAjaxCall,
  300
);

export function fetchFees(payload) {
  return dispatch => {
    makeFeeAjaxCall(payload, dispatch);
  };
}

function _makeFeeAjaxCall(payload, dispatch) {
  dispatch({ type: 'REQUEST_FEES', data: payload });

  // ajax call for destination amount
  axios
    .get('/api/fees', {
      params: payload
    })
    .then(resp => {
      dispatch({ type: 'RECEIVED_FEES_SUCCESS', data: resp.data });
    })
    .catch(resp => {
      var msg = getErrorMsg(resp);
      dispatch({
        type: 'RECEIVED_[AJAX_CALL]_FAILURE',
        data: { msg: msg, failedCall: 'fees' }
      });
    });
}

var makeFeeAjaxCall = debounce(_makeFeeAjaxCall, 300);

/*************
 * HELPERS
 * ************* */

// we'll handle all failures the same
function getErrorMsg(resp) {
  var msg = 'Error. Please try again later.';

  if (resp && resp.request && resp.request.status === 0) {
    msg = 'Oh no! App appears to be offline.';
  }

  return msg;
}
// on success ensure no error message
// function clearErrorMessage() {
//   if (this.state.errorMsg) {
//     this.setState({
//       errorMsg: ''
//     });
//   }
// }
