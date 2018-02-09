import axios from "axios"

export const fetchMyProfile = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/user/my_profile?token=asdf1234aaa&user_id=3963')
}

export const fetchChatLists = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/chat/chat_list?token=asdf1234aaa&user_id=3963&start=0&limit=50')
}

export const fetchFriendListCount = (group, filter) => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/friend/friend_list_count?token=asdf1234aaa&user_id=3963&friend_type=${group}&filter=${filter}`)
}

export const fetchFriendGroups = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_type_list')
}

export const fetchFriendLists = (group, range, start = 0, filter = '') => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/friend/friend_list?token=asdf1234aaa&user_id=3963&start=${start}&limit=50&filter=${filter}&friend_type=${group}`)
}

export const fetchFriendProfile = (userID) => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/data/${userID}`)
}

export const fetchChatInfo = (chat_room_id) => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/chat/data?token=asdf1234aaa&user_id=3963&chat_room_id=${chat_room_id}`)
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

export const updatePicture = (data) => {
    return  axios.post("http://itsmartone.com/bpk_connect/api/group/update_picture?token=asdf1234aaa", data)
}

export const updateGroupSetting = (data) => {
    return axios.post("http://itsmartone.com/bpk_connect/api/group/update_setting?token=asdf1234aaa", data).then((res) => {
        console.log(res)
    }, (err) => {
        console.log(err)
    })
}

export const fetchChat = (chatRoomId, topChatMessageId = '') => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/message/message_list?token=asdf1234aaa&user_id=3963&chat_room_id=${chatRoomId}&after_chat_message_id=&before_chat_message_id=${topChatMessageId}&limit=50`).then((res) => {
        return res
    }, (err) => {
        return err
    })
}

export const sendTheMessage = (chat_room_id, message_type, content, sticker_path, image_base64) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/message/send?token=asdf1234aaa` ,
        { user_id: '3963', chat_room_id, message_type, content, sticker_path, image_base64 }
    ).then((res) => {
        return res
    }, (err) => {
        return err
    })
}

export const fetchSticker = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/message/sticker_list?token=asdf1234aaa&user_id=3963')
}

export const muteChat = (chat_room_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/chat/mute?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963'
    }).then((res) => {
        return res
    }, (err) => {
        return err
    })
}

export const deleteChat = (chat_room_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/chat/delete?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963'
    })
}

export const hideChat = (chat_room_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/chat/hide?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963'
    })
}

export const blockChat = (chat_room_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/chat/block?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963'
    })
}

export const unblockChat = (chat_room_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/chat/unblock?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963'
    })
}

export const unmuteChat = (chat_room_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/chat/unmute?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963'
    })
}

export const setAsSeen = (chat_room_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/chat/read_message?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963'
    })
}

export const fetchInviteFriend = (chat_room_id, user_id, start=0, limit=30, filter='') => {
    return  axios.get(`http://itsmartone.com/bpk_connect/api/group/friend_list_for_invite?token=asdf1234aaa&chat_room_id=${chat_room_id}&user_id=${user_id}&start=${start}&limit=${limit}&filter=${filter}`)
}

export const inviteFriendToGroup = (chat_room_id, friend_user_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/group/invite?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963',
        friend_user_id
    })
}

export const removeFriendFromGroup = (chat_room_id, friend_user_id) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/group/remove_from_group?token=asdf1234aaa`, {
        chat_room_id,
        user_id: '3963',
        friend_user_id
    })
}
