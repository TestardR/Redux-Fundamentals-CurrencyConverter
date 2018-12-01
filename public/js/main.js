import React from 'react';
import ReactDOM from 'react-dom';
import store from './stores/configureStore';
import { Provider } from 'react-redux';
import Conversion from './components/conversion.js';

class MainComponent extends React.Component {
  // in order to rerender this component (and its children), we call setState once the component has rendered. Empty setState, trick to rerender
  componentDidMount() {
    store.subscribe(() => {
      this.setState({});
    });
  }
  render() {
    return (
      <div>
        <Conversion originAmount={store.getState().originAmount} />
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
