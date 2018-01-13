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
      case 'SIGNUP_ERROR':
          return Object.assign(state, {
              signupError: action.payload.error
          })
      default:
        return state
    }
}

const system = (state = {
    isShowFriendLists: {
        favorite: false,
        group: false,
        department: false,
        other: false
    }
}, action) => {
    switch (action.type) {
        case 'LANGUAGES':
            return Object.assign(state, {
                languages: action.payload.languages
            })
        case 'IS_SHOW_FRIEND_LISTS':
            return Object.assign(state, {
                isShowFriendLists: action.payload.isShowFriendLists
            })
        default:
            return state
    }
}

const friend = (state = {
    rangeFriendLists: {
        favorite: 100,
        group: 20,
        department: 20,
        other: 20
    }
}, action) => {
    switch (action.type) {
        case 'FRIEND_GROUPS':
            return Object.assign(state, {
                friendGroups: action.payload.friendGroups
            })
        case 'FRIENDS':
            return Object.assign(state, {
                friends: action.payload.friends
            })
        case 'NUMBER_OF_FRIEND_LISTS':
            return Object.assign(state, {
                numberOfFriendLists: action.payload.numberOfFriendLists
            })
        default:
            return state
    }
}

const chat = (state = {}, action) => {
    switch (action.type) {
        case 'CHAT_LISTS':
            return Object.assign(state, {
                chatLists: action.payload.chatLists
            })
        default:
            return state
    }
}

export default combineReducers({
    user,
    system,
    friend,
    chat
})
