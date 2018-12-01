import React from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { connect } from 'react-redux';
import FeesTable from '../components/FeesTable';
import * as actions from '../actions/actions';

class Conversion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //   originAmount: '0.00',
      // originCurrency: 'USD',
      // destinationAmount: '0.00',
      // destinationCurrency: 'EUR',
      // feeAmount: 0.0,
      // conversionRate: 1.5,
      // totalCost: 0.0,
      // errorMsg: ''
    };

    // bind event listeners so 'this' will be available in the handlers
    this.handleOriginAmountChange = this.handleOriginAmountChange.bind(this);
    this.handleDestAmountChange = this.handleDestAmountChange.bind(this);
    this.handleOriginCurrencyChange = this.handleOriginCurrencyChange.bind(
      this
    );
    this.handleDestCurrencyChange = this.handleDestCurrencyChange.bind(this);
    // this.handleAjaxFailure = this.handleAjaxFailure.bind(this);
  }

  componentDidMount() {
    // Add a debounced version of _getDestinationAmount() so we avoid server & UI Thrashing.
    // See http://stackoverflow.com/questions/23123138/perform-debounce-in-react-js/28046731#28046731
    this.makeConversionAjaxCall = debounce(this._makeConversionAjaxCall, 350);
    this.makeFeeAjaxCall = debounce(this._makeFeeAjaxCall, 350);

    this.originAmountInput.focus();
  }

  handleOriginCurrencyChange(event) {
    var newCurrency = event.target.value;
    this.props.dispatch(actions.changeOriginCurrency(newCurrency));

    var payload = {
      originAmount: this.props.originAmount,
      originCurrency: newCurrency,
      destCurrency: this.props.destinationCurrency,
      calcOriginAmount: false
    };

    this.props.dispatch(actions.fetchConversionRate(payload));

    var feePayload = {
      originAmount: this.props.originAmount,
      originCurrency: newCurrency,
      destCurrency: this.props.destinationCurrency
    };

    this.props.dispatch(actions.fetchFees(feePayload));
  }

  handleDestCurrencyChange(event) {
    var newCurrency = event.target.value;
    this.props.dispatch(actions.changeDestCurrency(newCurrency));

    var payload = {
      originAmount: this.props.originAmount,
      originCurrency: this.props.originCurrency,
      destCurrency: newCurrency,
      calcOriginAmount: false
    };

    this.props.dispatch(actions.fetchConversionRate(payload));

    var feePayload = {
      originAmount: this.props.originAmount,
      originCurrency: this.props.originCurrency,
      destCurrency: newCurrency
    };

    this.props.dispatch(actions.fetchFees(feePayload));
  }

  handleCurrencyChange(currentlyEditing, event) {
    var obj = {};
    if (currentlyEditing === 'origin') {
      obj.originCurrency = event.target.value;
    } else {
      obj.destinationCurrency = event.target.value;
    }

    // just change both...
    // we have to use the callback so `this.state` will reflect the proper values
    // when they are called in _makeConversionAjaxCall()
    this.setState(obj, () => {
      // get new dest amount & conversion rates
      this.makeConversionAjaxCall({}, resp => {
        this.clearErrorMessage();

        this.setState({
          originAmount: resp.originAmount,
          destinationAmount: resp.destAmount,
          // destinationAmount: this.props.destinationAmount,
          conversionRate: resp.xRate
        });

        // get the new fee & total amount
        this.makeFeeAjaxCall(
          {
            originAmount: resp.originAmount,
            originCurrency: this.props.originCurrency,
            destCurrency: this.props.destinationCurrency
          },
          response => {
            this.setState({
              feeAmount: response.feeAmount
            });

            this.calcNewTotal();
          },
          this.handleAjaxFailure
        );
      });
    });
  }
  handleOriginAmountChange(event) {
    var newAmount = event.target.value;

    // remove unallowed chars
    newAmount = newAmount.replace(',', '');

    // optimistic field updates
    this.props.dispatch(actions.changeOriginAmount(newAmount));

    var payload = {
      originAmount: newAmount,
      originCurrency: this.props.originCurrency,
      destCurrency: this.props.destinationCurrency,
      calcOriginAmount: false
    };

    this.props.dispatch(actions.fetchConversionRate(payload));

    var feePayload = {
      originAmount: newAmount,
      originCurrency: this.props.originCurrency,
      destCurrency: this.props.destinationCurrency
    };

    this.props.dispatch(actions.fetchFees(feePayload));
  }

  handleDestAmountChange(event) {
    var newAmount = event.target.value;

    // remove unallowed chars
    newAmount = newAmount.replace(',', '');

    // optimistic field updates
    this.props.dispatch(actions.changeDestAmount(newAmount));

    var payload = {
      destAmount: newAmount,
      originCurrency: this.props.originCurrency,
      destCurrency: this.props.destinationCurrency,
      calcOriginAmount: true
    };

    this.props.dispatch(actions.fetchConversionRateAndFees(payload));

    // var feePayload = {
    //   originAmount: newAmount,
    //   originCurrency: this.props.originCurrency,
    //   destCurrency: this.props.destinationCurrency
    // };

    // this.props.dispatch(actions.fetchFees(feePayload));
  }

  // handleDestAmountChange(event) {
  //   var newAmount = event.target.value;

  //   // remove unallowed chars
  //   newAmount = newAmount.replace(',', '');
  //   // optimistic update
  //   this.setState({ destinationAmount: newAmount });

  //   this.makeConversionAjaxCall(
  //     {
  //       currentlyEditing: 'dest',
  //       newValue: newAmount
  //     },
  //     resp => {
  //       // make ajax call to get the fee amount..
  //       var newState = {
  //         conversionRate: resp.xRate,
  //         originAmount: resp.originAmount
  //       };

  //       this.setState(newState);

  //       // get the new fee & total amount
  //       this.makeFeeAjaxCall(
  //         {
  //           originAmount: resp.originAmount,
  //           originCurrency: this.props.originCurrency,
  //           destCurrency: this.props.destinationCurrency
  //         },
  //         resp => {
  //           this.setState({
  //             feeAmount: resp.feeAmount
  //           });

  //           this.calcNewTotal();
  //         },
  //         this.handleAjaxFailure
  //       );
  //     }
  //   );
  // }
  // this is debounced in `componentDidMount()` as this.makeConversionAjaxCall()
  _makeConversionAjaxCall(data, successCallback, failureCallback) {
    var originCurrency = this.props.originCurrency;
    var destCurrency = this.props.destinationCurrency;

    var payload = {
      originAmount: data.newValue || this.props.originAmount,
      destAmount: data.newValue || this.state.destAmount,
      originCurrency: originCurrency,
      destCurrency: destCurrency,
      calcOriginAmount: false
    };

    // determine whether we need to calc origin or dest amount
    if (data.currentlyEditing === 'dest') {
      payload.calcOriginAmount = true;
    }

    // ajax call for destination amount
    // originCurrency, destCurrency, originAmount
    axios
      .get('/api/conversion', {
        params: payload
      })
      .then(resp => {
        successCallback(resp.data);
      })
      .catch(failureCallback);
  }
  // this is debounced in `componentDidMount()`
  _makeFeeAjaxCall(payload, successCallback, failureCallback) {
    axios
      .get('/api/fees', {
        params: payload
      })
      .then(resp => {
        successCallback(resp.data);
      })
      .catch(failureCallback);
  }
  calcNewTotal() {
    var newTotal =
      parseFloat(this.props.originAmount, 10) +
      parseFloat(this.state.feeAmount, 10);
    this.setState({ totalCost: parseFloat(newTotal) });
  }

  render() {
    if (this.props.errorMsg) {
      var errorMsg = <div className="errorMsg">{this.props.errorMsg}</div>;
    }
    return (
      <div>
        {errorMsg}
        <label>Convert</label>&nbsp;
        <input
          className="amount-field"
          ref={input => (this.originAmountInput = input)}
          onChange={this.handleOriginAmountChange}
          value={this.props.originAmount}
        />
        <select
          value={this.props.originCurrency}
          onChange={this.handleOriginCurrencyChange}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
        </select>
        to{' '}
        <input
          className="amount-field"
          onChange={this.handleDestAmountChange}
          value={this.props.destinationAmount}
        />
        &nbsp;
        <select
          value={this.props.destinationCurrency}
          onChange={this.handleDestCurrencyChange}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
        </select>
        <br />
        <br />
        <br />
        <FeesTable
          originCurrency={this.props.originCurrency}
          destinationCurrency={this.props.destinationCurrency}
          conversionRate={this.props.conversionRate}
          fee={this.props.feeAmount}
          total={this.props.totalCost}
        />
      </div>
    );
  }
}

export default connect((state, props) => {
  console.log('state', state);
  return {
    originAmount: state.amount.originAmount,
    destinationAmount: state.amount.destinationAmount,
    originCurrency: state.amount.originCurrency,
    destinationCurrency: state.amount.destinationCurrency,
    conversionRate: state.amount.conversionRate,
    feeAmount: state.amount.feeAmount,
    totalCost: state.amount.totalCost,
    errorMsg: state.error.errorMsg
  };
})(Conversion);
