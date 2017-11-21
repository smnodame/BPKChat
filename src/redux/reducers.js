import { combineReducers } from 'redux'

// const posts = (state = [], action) => {
//   switch (action.type) {
//     case 'ADD_POST':
//       return [
//         ...state,
//         {
//           id: action.id,
//           post: action.post
//         }
//       ]
//     default:
//       return state
//   }
// }

const users = (state = [], action) => {
    switch (action.type) {
      case 'AUTHENTICATED':
          return [
              ...state,
              {
                  token: action.payload.token,
                  expire: action.payload.expire
              }
          ]
      default:
        return state
    }
}


export default combineReducers({
  users
})
