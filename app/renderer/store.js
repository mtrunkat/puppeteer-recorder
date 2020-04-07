import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { connectRouter, routerMiddleware, push } from 'connected-react-router';
// import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';

import recorder from './reducers/recorder';
import recorderActions from './actions/recorder';

export default function configureStore(initialState, routerHistory) {
  const router = routerMiddleware(routerHistory);

  const actionCreators = {
    ...recorderActions,
    push,
  };

  const reducers = {
    router: connectRouter(routerHistory),
    recorder,
  };

  const middlewares = [thunk, router];

  const composeEnhancers = (() => {
    const compose_ = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (process.env.NODE_ENV === 'development' && compose_) {
      return compose_({ actionCreators });
    }
    return compose;
  })();

  // const enhancer = composeEnhancers(applyMiddleware(...middlewares), persistState());
  const enhancer = composeEnhancers(applyMiddleware(...middlewares));
  const rootReducer = combineReducers(reducers);

  return createStore(rootReducer, initialState, enhancer);
}
