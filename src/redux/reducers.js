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
        case 'NAVIGATE':
            return Object.assign(state, {
                navigate: action.payload.navigate
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
    },
    filter: ''
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
        case 'ON_SEARCH_FRIEND':
            return Object.assign(state, {
                filter: action.payload.filter
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
        case 'CHAT':
            return Object.assign(state, {
                chat: action.payload.chat
            })
        case 'SELECTED_CHAT_ROOM_ID':
            return Object.assign(state, {
                chatRoomId: action.payload.chatRoomId
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
