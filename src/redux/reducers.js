import { combineReducers } from 'redux'

const users = (state = {}, action) => {
    switch (action.type) {
      case 'AUTHENTICATED':
          return Object.assign(state, {
              token: action.payload.token,
              expire: action.payload.expire
          })
      case 'SIGNIN_ERROR':
          return Object.assign(state, {
              error: action.payload.error
          })
      default:
        return state
    }
}


export default combineReducers({
  users
})
