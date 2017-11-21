export const signIn = (username, password) => ({
  type: 'SIGNIN',
  payload: {
      username,
      password
  }
})


export const authenticated = (token, expire) => ({
    type: 'AUTHENTICATED',
    payload: {
        token,
        expire
    }
})
