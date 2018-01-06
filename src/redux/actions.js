export const signIn = (username, password) => ({
  type: 'SIGNIN',
  payload: {
      username,
      password
  }
})

export const signInError = (error) => ({
    type: 'SIGNIN_ERROR',
    payload: {
        error
    }
})

export const authenticated = (token, expire) => ({
    type: 'AUTHENTICATED',
    payload: {
        token,
        expire
    }
})
