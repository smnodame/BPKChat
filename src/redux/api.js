import axios from "axios"
import React from 'react'
import { AsyncStorage } from 'react-native'

export const getAuth = () => {
    return AsyncStorage.getItem('user_id').then((user_id) => {
        return user_id
    }, (err) => {
        return err
    }).catch((err) => {
        console.log('[getAuth] err ', err)
    })
}

export const fetchMyProfile = () => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/user/my_profile?token=asdf1234aaa&user_id=${user_id}`)
    })
}

export const fetchChatLists = () => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/chat/chat_list?token=asdf1234aaa&user_id=${user_id}&start=0&limit=10`)
    })
}

export const fetchFriendListCount = (group, filter) => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/friend/friend_list_count?token=asdf1234aaa&user_id=${user_id}&friend_type=${group}&filter=${filter}`)
    })
}

export const fetchFriendGroups = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_type_list')
}

export const fetchFriendLists = (group, range, start = 0, filter = '') => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/friend/friend_list?token=asdf1234aaa&user_id=${user_id}&start=${start}&limit=50&filter=${filter}&friend_type=${group}`)
    })
}

export const fetchFriendProfile = (userID) => {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/data/${userID}`)
}

export const fetchChatInfo = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/chat/data?token=asdf1234aaa&user_id=${user_id}&chat_room_id=${chat_room_id}`)
    })
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

export const fetchChat = (chatRoomId, topChatMessageId = '', after_chat_message_id = '', search = '') => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/message/message_list?token=asdf1234aaa&user_id=${user_id}&chat_room_id=${chatRoomId}&after_chat_message_id=${after_chat_message_id}&before_chat_message_id=${topChatMessageId}&limit=20&search=${search}`).then((res) => {
            return res
        }, (err) => {
            console.log('[fetchChat] Reject ', err)
            return {
                data: {
                    data: []
                }
            }
        }).catch((err) => {
            console.log('[fetchChat] Error ', err)
        })
    })
}

export const sendTheMessage = (chat_room_id, message_type, content, sticker_path, image_base64, copy_chat_message_id = '') => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/message/send?token=asdf1234aaa` ,
            { user_id: user_id, chat_room_id, message_type, content, sticker_path, image_base64, copy_chat_message_id }
        )
    })
}

export const fetchSticker = () => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/message/sticker_list?token=asdf1234aaa&user_id=${user_id}`)
    })
}

export const muteChat = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/mute?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const deleteChat = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/delete?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const hideChat = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/hide?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const blockChat = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/block?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const unblockChat = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/unblock?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const unmuteChat = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/unmute?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const setAsSeen = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/read_message?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const fetchInviteFriend = (chat_room_id, user_id, start=0, limit=30, filter='') => {
    return  axios.get(`http://itsmartone.com/bpk_connect/api/group/friend_list_for_invite?token=asdf1234aaa&chat_room_id=${chat_room_id}&user_id=${user_id}&start=${start}&limit=${limit}&filter=${filter}`)
}

export const inviteFriendToGroup = (chat_room_id, friend_user_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/group/invite?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id,
            friend_user_id
        })
    })
}

export const removeFriendFromGroup = (chat_room_id, friend_user_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/group/remove_from_group?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id,
            friend_user_id
        })
    })
}

export const exitTheGroup = (chat_room_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/group/exit_group?token=asdf1234aaa`, {
            chat_room_id,
            user_id: user_id
        })
    })
}

export const friendInGroup = (chat_room_id, start=0, limit=20, filter='') => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/group/friend_list_for_remove?token=asdf1234aaa&chat_room_id=${chat_room_id}&user_id=${user_id}&start=${start}&limit=${limit}&filter=${filter}`)
    })
}

export const updateProfile = (data) => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/user/update_setting?token=asdf1234aaa`, data)
}

export const updatePictureAuth = (data) => {
    return  axios.post("http://itsmartone.com/bpk_connect/api/user/update_picture?token=asdf1234aaa", data)
}

export const inviteFriendToGroupWithOpenCase = (data) => {
    return fetch('http://itsmartone.com/bpk_connect/api/group/open_case?token=asdf1234aaa', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            }).then(res=>res.json())
}

export const createNewRoom = (friend_user_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/chat/create?token=asdf1234aaa`, {
            user_id: user_id,
            friend_user_id
        })
    })
}

export const fetchKeepProfile = () => {
    return getAuth().then((user_id) => {
        return axios.get(`http://itsmartone.com/bpk_connect/api/chat/get_keep_room_data?token=asdf1234aaa&user_id=${user_id}`)
    })
}

export const saveInKeep = (copy_chat_message_id) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/message/keep?token=asdf1234aaa`, {
            user_id,
            chat_room_id: "",
            message_type: "",
            copy_chat_message_id,
            content: "",
            sticker_path: ""
        })
    })
}

export const saveNotiToken = (token) => {
    return getAuth().then((user_id) => {
        return axios.post(`http://itsmartone.com/bpk_connect/api/user/save_noti_android_token?token=asdf1234aaa`, {
            user_id,
            android_token: token
        })
    })
}
