import SocketIOClient from 'socket.io-client'

import { fetchChatLists } from './api.js'
import { chatLists } from './actions.js'
import { store } from './index.js'

const socket = SocketIOClient('http://192.168.1.39:4444/')
const user_id = '3963'

export const on_message = () => {
    socket.on('message', function(data) {
        console.log('Incoming message:', data)
    })
}

export const emit_subscribe = (user_id, chat_room_id) => {
    socket.emit('subscribe', {
        user_id,
        chat_room_id
    })
}

export const emit_unsubscribe = (user_id, chat_room_id) => {
    socket.emit('unsubscribe', {
        user_id,
        chat_room_id
    })
}

export const emit_unsubscribeall = () => {
    socket.emit('unsubscribeall')
}

export const emit_subscribe_chat_list = (user_id) => {
    socket.emit('subscribeChatList', {
        user_id
    })
}

export const emit_unsubscribe_chat_list = (user_id) => {
    socket.emit('unsubscribeChatList', {
        user_id
    })
}

export const emit_update_friend_chat_list = (user_id, friend_user_id) => {
    socket.emit('updateFriendChatList', {
        user_id,
        friend_user_id
    })
}

export const on_update_friend_chat_list = () => {
    socket.on('updateFriendChatList', () => {
        fetchChatLists().then((res) => {
            store.dispatch(chatLists(_.get(res, 'data.data', [])))
        })

    })
}

export const emit_message = (message, chat_room_id) => {
    socket.emit('message', {
        message,
        chat_room_id
    })
}

export const emit_read_message = (user_id, chat_room_id) => {
    socket.emit('read_message', {
        user_id,
        chat_room_id
    })
}

export const emit_read_all = (user_id, chat_room_id) => {
    socket.emit('read_all', {
        user_id,
        chat_room_id
    })
}


export const start_socket = () => {
    // Connect!
    socket.connect();

    // An event to be fired on connection to socket
    socket.on('connect', () => {
        console.log(' socket conntected ')
    })

    emit_subscribe_chat_list(user_id)
    on_update_friend_chat_list()
}
