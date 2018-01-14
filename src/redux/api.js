import axios from "axios"

export const fetchMyProfile = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/user/my_profile?token=asdf1234aaa&user_id=3963')
}

export const fetchChatLists = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/chat/chat_list?token=asdf1234aaa&user_id=3963&start=0&limit=20')
}

export const fetchFriendListCount = (group) => {
    console.log('=============')
    console.log(group)
    return axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_list_count?token=asdf1234aaa&user_id=3963&friend_type=${group}&filter=')
}

export const fetchFriendGroups = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_type_list')
}

export const fetchFriendLists = (group, range, start = 0) => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/friend/friend_list?token=asdf1234aaa&user_id=3963&start=${start}&limit=${range}&filter=&friend_type=${group}`)
}

export const fetchFriendProfile = (userID) => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/data/${userID}`)
}

export const loginApi = (username, password) => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/check_login?user_id=${username}&password=${password}`)
}

export const fetchLanguage = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/user/language_list')
}

export const updateProfileImage = () => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/group/update_picture`, {
        token: 'asdf1234aaa',
    })
}

export const addFavoriteApi = (user_id, friend_user_id) => {
    return axios.post('http://itsmartone.com/bpk_connect/api/friend/add_fav', {
        token: 'asdf1234aaa',
        user_id,
        friend_user_id
    })
}

export const removeFavoriteApi = (user_id, friend_user_id) => {
    return axios.post('http://itsmartone.com/bpk_connect/api/friend/remove_fav', {
        token: 'asdf1234aaa',
        user_id,
        friend_user_id
    })
}

export const createNewAccount = (id, password, display_name, mobile_no, language) => {
    return axios.post('http://itsmartone.com/bpk_connect/api/user/register', {
        username: id,
        password,
        display_name,
        mobile_no,
        user_language_id: language
    })
}
