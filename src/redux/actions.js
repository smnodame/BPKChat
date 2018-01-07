export const signin = (username, password) => ({
  type: 'SIGNIN',
  payload: {
      username,
      password
  }
})

export const signin_error = (error) => ({
    type: 'SIGNIN_ERROR',
    payload: {
        error
    }
})

export const signup = (id, password, confirm_password, display_name, mobile_no, language_id) => ({
    type: 'SIGNUP',
    payload: {
        id,
        password,
        confirm_password,
        display_name,
        mobile_no,
        language_id
    }
})

export const authenticated = (token, setting, user) => ({
    type: 'AUTHENTICATED',
    payload: {
        token,
        setting,
        user
    }
})

export const friendGroups = (friendGroups) => ({
    type: 'FRIEND_GROUPS',
    payload: {
        friendGroups
    }
})

export const start_app = () => ({
    type: 'START_APP'
})

export const friends = (friends) => ({
    type: 'FRIENDS',
    payload: {
        friends
    }
})

export const enterContacts = () => ({
    type: 'ENTER_CONTACTS'
})

export const myprofile = (data) => ({
    type: 'MY_PROFILE',
    payload: {
        myprofile: data
    }
})

export const languages = (languages) => ({
    type: 'LANGUAGES',
    payload: {
        languages
    }
})
