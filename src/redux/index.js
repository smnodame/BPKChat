// Redux Saga
import createSagaMiddleware from 'redux-saga'

// Redux
import { createStore, applyMiddleware } from 'redux'

// Reducers
import Reducers from './reducers'

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()

// Saga
import rootSaga from './sagas'

// mount it on the Store
export const store = createStore(
  Reducers,
  applyMiddleware(sagaMiddleware)
)

sagaMiddleware.run(rootSaga)
