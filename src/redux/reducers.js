import { combineReducers } from 'redux'

const user = (state = {}, action) => {
    switch (action.type) {
      case 'AUTHENTICATED':
          return Object.assign(state, {
              token: action.payload.token,
              setting: action.payload.setting,
              user: action.payload.user
          })
      case 'SIGNIN_ERROR':
          return Object.assign(state, {
              error: action.payload.error
          })
      case 'MY_PROFILE':
          return Object.assign(state, {
              setting: action.payload.myprofile.setting,
              user: action.payload.myprofile.user
          })
      default:
        return state
    }
}

const system = (state = {}, action) => {
    switch (action.type) {
        case 'LANGUAGES':
            return Object.assign(state, {
                languages: action.payload.languages
            })
        default:
            return state
    }
}

const friend = (state = {}, action) => {
    switch (action.type) {
        case 'FRIEND_GROUPS':
            return Object.assign(state, {
                friendGroups: action.payload.friendGroups
            })
        case 'FRIENDS':
            return Object.assign(state, {
                friends: action.payload.friends
            })
        default:
            return state
    }
}
export default combineReducers({
  user,
  system,
  friend
})
