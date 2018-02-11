import _ from 'lodash'
import SocketIOClient from 'socket.io-client'

import { fetchChatLists, fetchChat, setAsSeen } from './api.js'
import { chatLists, chat } from './actions.js'
import { store } from './index.js'

const socket = SocketIOClient('http://192.168.1.39:4444/')
const user_id = '3963'

export const on_message = () => {
    socket.on('message', function(data) {
        console.log('Incoming message:', data)

        const state = store.getState()
        const chatInfo = _.get(state, 'chat.chatInfo')

        const messageLists = _.get(state, 'chat.chat')

        const lastChatMessageId = _.get(messageLists[0], 'chat_message_id', '0')

        fetchChat(chatInfo.chat_room_id, '', lastChatMessageId).then((res) => {
            const chatData = _.get(res, 'data.data', []).concat(messageLists)
            // store data in store redux
            store.dispatch(chat(chatData))
        })

        setAsSeen(chatInfo.chat_room_id).then(() => {
            emit_as_seen(chatInfo.chat_room_id)
        })
    })
}

export const emit_as_seen = (chat_room_id) => {
    socket.emit('read_all', {
        chat_room_id,
        user_id: '3963'
    })
}

export const on_as_seen = () => {
    socket.on('read_all', (user_id) => {
        // fetch new message if is not own message
        if(user_id != '3963') {
            const state = store.getState()
            const messageLists = _.get(state, 'chat.chat')

            messageLists.forEach((message, index) => {
                if(message.who_read.indexOf(user_id) < 0) {
                    messageLists[index].who_read.push(user_id)
                }
            })
            store.dispatch(chat(messageLists))
        }
    })
}

export const emit_subscribe = (chat_room_id) => {
    socket.emit('subscribe', {
        chat_room_id
    })
}

export const emit_unsubscribe = (chat_room_id) => {
    socket.emit('unsubscribe', {
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

// export const emit_read_message = (user_id, chat_room_id) => {
//     socket.emit('read_message', {
//         user_id,
//         chat_room_id
//     })
// }
//
// export const emit_read_all = (user_id, chat_room_id) => {
//     socket.emit('read_all', {
//         user_id,
//         chat_room_id
//     })
// }

export const start_socket = () => {
    // Connect!
    socket.connect();

    // An event to be fired on connection to socket
    socket.on('connect', () => {
        console.log(' socket conntected ')
    })

    emit_subscribe_chat_list(user_id)
    on_update_friend_chat_list()
    on_as_seen()
}
