import _ from 'lodash'
import SocketIOClient from 'socket.io-client'

import { fetchChatLists, fetchChat, setAsSeen } from './api.js'
import { chatLists, chat } from './actions.js'
import { store } from './index.js'

const socket = SocketIOClient('http://172.20.10.2:4444/', {
    transports: ['websocket']
})
let user_id = ''

export const on_message = () => {
    socket.on('message', function(data) {
        console.log('Incoming message:', data.message)
        console.log(data)

        if(user_id == data.user_id) {
            const state = store.getState()
            const chatInfo = _.get(state, 'chat.chatInfo')

            const messageLists = _.get(state, 'chat.chat', [])

            const lastChatMessageId = state.lastMessageID || '0'

            fetchChat(chatInfo.chat_room_id, '', lastChatMessageId).then((res) => {
                // const chatData = _.get(res, 'data.data', []).concat(messageLists)

                const indexLocal = messageLists.findIndex((message) => {
                    return message.draft_message_id == data.draft_message_id
                })

                const indexOrigin = _.get(res, 'data.data', []).findIndex((message) => {
                    return message.chat_message_id == data.chat_message_id
                })

                messageLists[indexLocal] = _.get(res, 'data.data', [])[indexOrigin]

                // store data in store redux
                store.dispatch(chat(messageLists))
            })

        } else {
            const state = store.getState()
            const chatInfo = _.get(state, 'chat.chatInfo')

            const messageLists = _.get(state, 'chat.chat')

            const lastChatMessageId = messageLists.find((message) => {
                return message.chat_message_id[0] != '_'
            }).chat_message_id

            fetchChat(chatInfo.chat_room_id, '', lastChatMessageId).then((res) => {
                const chatData = _.get(res, 'data.data', []).concat(messageLists)
                // store data in store redux
                store.dispatch(chat(chatData))
            })

            setAsSeen(chatInfo.chat_room_id).then(() => {
                emit_as_seen(chatInfo.chat_room_id)
            })
        }
    })
}

export const emit_as_seen = (chat_room_id) => {
    console.log('[emit_as_seen] start ')
    socket.emit('read_all', {
        chat_room_id,
        user_id: user_id
    })
}

export const on_as_seen = () => {
    socket.on('read_all', (user_id_from_socket) => {
        console.log('[subscribe read_all]')
        // fetch new message if is not own message
        if(user_id_from_socket != user_id) {
            const state = store.getState()
            const messageLists = _.get(state, 'chat.chat')

            messageLists.forEach((message, index) => {
                if(message.who_read.indexOf(user_id_from_socket) < 0) {
                    messageLists[index].who_read.push(user_id_from_socket)
                }
            })
            store.dispatch(chat(messageLists))
        }
    })
}

export const emit_subscribe = (chat_room_id) => {
    console.log('[emit_subscribe]')
    socket.emit('subscribe', {
        chat_room_id
    })
}

export const emit_unsubscribe = (chat_room_id) => {
    console.log('[emit_unsubscribe]')
    socket.emit('unsubscribe', {
        chat_room_id
    })
}

export const emit_unsubscribeall = () => {
    console.log('[emit_unsubscribeall]')
    socket.emit('unsubscribeall')
}

export const emit_subscribe_chat_list = (user_id) => {
    console.log('[emit_subscribe_chat_list]', user_id)
    socket.emit('subscribeChatList', {
        user_id
    })
}

export const emit_unsubscribe_chat_list = (user_id) => {
    console.log('[emit_unsubscribe_chat_list]')
    socket.emit('unsubscribeChatList', {
        user_id
    })
}

export const emit_update_friend_chat_list = (user_id, friend_user_id) => {
    console.log('[emit_update_friend_chat_list]', user_id, friend_user_id)
    socket.emit('updateFriendChatList', {
        user_id,
        friend_user_id
    })
}

export const on_update_friend_chat_list = () => {
    socket.on('updateFriendChatList', () => {
        console.log('[subscribe updateFriendChatList]')
        fetchChatLists().then((res) => {
            store.dispatch(chatLists(_.get(res, 'data.data', [])))
        })

    })
}

export const emit_message = (message, chat_room_id, user_id, chat_message_id, draft_message_id) => {
    console.log('[emit_message]')
    const req = {
        message,
        chat_room_id,
        user_id,
        chat_message_id,
        draft_message_id
    }
    console.log(req)
    socket.emit('message', req)
}

export const emit_call = (sender, receiver) => {
    socket.emit('call', {
        sender,
        receiver
    })
}

export const on_incomming_call = () => {
    socket.on('incoming_call', (data) => {
        console.log('call from '+ data.sender +' to '+ data.receiver)
    })
}

export const start_socket = (user_id_from_store) => {
    // Connect!
    socket.connect();

    // An event to be fired on connection to socket
    socket.on('connect', () => {
        console.log(' socket conntected ')
    })

    // get user_id from store
    user_id = user_id_from_store
    emit_subscribe_chat_list(user_id)
    on_update_friend_chat_list()
    on_as_seen()
    on_message()
    on_incomming_call()

    socket.on('reconnect', (socket) => {
        console.log('Re-connected')
    })

    socket.on('connect_error', function(error){
        console.log('Connection Failed')
        console.log(error)
    })
}
