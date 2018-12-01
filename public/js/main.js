import React from 'react';
import ReactDOM from 'react-dom';
import store from './stores/configureStore';
import { Provider } from 'react-redux';
import Conversion from './containers/Conversion.js';

class MainComponent extends React.Component {
  render() {
    return (
      <div>
        <Conversion />
      </div>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <MainComponent />
  </Provider>,
  document.getElementById('container')
);
