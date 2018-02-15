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
        case 'SHARED_MESSAGE':
            return Object.assign(state, {
                sharedMessage: action.payload.sharedMessage
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

const chat = (state = {
    isShowActionChat: false,
    selectedChatRoomId: ''
}, action) => {
    switch (action.type) {
        case 'CHAT_LISTS':
            return Object.assign(state, {
                chatLists: action.payload.chatLists
            })
        case 'CHAT':
            return Object.assign(state, {
                chat: action.payload.chat
            })
        case 'SELECTED_CHAT_INFO':
            return Object.assign(state, {
                chatInfo: action.payload.chatInfo
            })
        case 'STICKER':
            return Object.assign(state, {
                sticker: action.payload.sticker
            })
        case 'IS_SHOW_ACTION_CHAT':
            return Object.assign(state, {
                isShowActionChat: action.payload.isShowActionChat,
                selectedChatRoomId: action.payload.selectedChatRoomId
            })
        case 'INVITE_FRIENDS':
            return Object.assign(state, {
                inviteFriends: action.payload.friends
            })
        case 'MEMBER_IN_GROUP':
            return Object.assign(state, {
                memberInGroup: action.payload.friends
            })
        case 'OPTION_MESSAGE':
            return Object.assign(state, {
                optionMessage: action.payload.message
            })
        case 'IS_SHOW_SEARCH_BAR':
            let chat = {}
            if(!action.payload.isShow) {
                chat = {
                    chat: []
                }
            }
            return Object.assign(state, {
                isShowSearchBar: action.payload.isShow,
            }, chat)
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
