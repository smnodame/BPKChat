import _ from "lodash"
import React from 'react'
import { AsyncStorage } from 'react-native'
import { all, call, put, takeEvery, takeLatest, take, select, delay } from 'redux-saga/effects'
import {
    numberOfFriendLists,
    signin_error,
    languages,
    authenticated,
    friendGroups,
    updateFriendLists,
    friends,
    myprofile,
    signupEror,
    searchNewFriend,
    chatLists,
    selectedChatInfo,
    chat,
    onSticker,
    sticker,
    onIsShowActionChat,
    inviteFriends,
    selectChat,
    memberInGroup,
    optionMessage,
    enterContact,
    enterSplash,
    onFetchMessageLists,
    sharedMessage,
    onUpdateGroupLists,
    keepProfile,
    isLoading,
    lastMessageID
} from './actions'
import { NavigationActions } from 'react-navigation'
import {
    fetchMyProfile,
    fetchChatLists,
    fetchFriendListCount,
    fetchFriendGroups,
    fetchFriendLists,
    fetchFriendProfile,
    loginApi,
    fetchLanguage,
    updateProfileImage,
    addFavoriteApi,
    removeFavoriteApi,
    createNewAccount,
    fetchChat,
    fetchSticker,
    muteChat,
    hideChat,
    blockChat,
    deleteChat,
    setAsSeen,
    unblockChat,
    unmuteChat,
    fetchInviteFriend,
    inviteFriendToGroup,
    fetchChatInfo,
    removeFriendFromGroup,
    exitTheGroup,
    friendInGroup,
    updateProfile,
    inviteFriendToGroupWithOpenCase,
    createNewRoom,
    updatePictureAuth,
    fetchKeepProfile,
    logoutApi
} from './api'
import {
    getFriendGroups,
    getFriends,
    getNumberOfGroup,
    getRangeOfGroup,
    getFilterFriend,
    navigateSelector,
    getMessageLists,
    getChatInfo,
    getSelectedActionChatRoomId,
    getChatLists,
    getUserInfo,
    getInviteFriendLists,
    getMemberInGroup,
    getOptionMessageLists,
    getSharedMessage,
    getKeepProfile
} from './selectors'
import { start_socket, emit_subscribe, on_message, emit_message, emit_update_friend_chat_list, emit_as_seen } from './socket.js'
import * as NavigationService from '../services/NavigationService.js'

export const getAuth = () => {
    return AsyncStorage.getItem('user_id').then((user_id) => {
        return user_id
    }, (err) => {
        return err
    }).catch((err) => {
        console.log('[getAuth] err ', err)
    })
}

function* onStickerSaga() {
    while (true) {
        yield take('ON_STICKER')

        const stickerData = yield call(fetchSticker)

        const sticker_base_url = _.get(stickerData, 'data.sticker_base_url')
        const collections = _.get(stickerData, 'data.data', [])

        const collectionsLists = collections.map((c, index) => {
            const stickerLists = c.sticker_file_list.split(',')
            const stickerObj = stickerLists.map((s) => {
                return {
                    url: `${sticker_base_url}/${c.sticker_folder}/${s}`,
                    file: s,
                    path: `${c.sticker_folder}/${s}`
                }
            })
            return {
                sticker_collection_id: c.sticker_collection_id,
                collection_image_url: `${sticker_base_url}/${c.sticker_folder}/${stickerLists[0]}`,
                sticker_collection_name: c.sticker_collection_name,
                sticker_lists: stickerObj,
                key: index
            }
        })

        yield put(sticker(collectionsLists))
    }
}

function* onSearchFriendSata() {
    while (true) {
        const { payload: { filter }} = yield take('ON_SEARCH_FRIEND')
        const groups = yield select(getFriendGroups)

        // fetch initial friend lists
        const rangeFriendLists = yield select(getRangeOfGroup)
        const friendsData = yield call(combinedFriends, groups, rangeFriendLists, filter)
        yield put(friends(friendsData))

        // fetch number of friend lists
        const numberOfFriend = yield call(fetchNumberOfGroup, filter)
        yield put(numberOfFriendLists(numberOfFriend))
    }
}

function* addFavoriteSaga() {
    while (true) {
        const { payload: { user_id, friend_user_id, friend_data }} = yield take('ADD_FAVORITE')

        // get all friend
        const friendsData = yield select(getFriends)

        // add friend to favorite group
        friendsData.favorite.push(friend_data)

        // update in store
        yield put(friends(friendsData))
        yield call(addFavoriteApi, user_id, friend_user_id)
    }
}

function* removeFavoriteSaga() {
    while (true) {
        const { payload: { user_id, friend_user_id }} = yield take('REMOVE_FAVORITE')

        // get all friend
        const friendsData = yield select(getFriends)

        // get favorite friend
        const favorite = _.get(friendsData, 'favorite', [])

        // filter for removing friend in favorite
        const newFavorite = favorite.filter((friend) => {
            return friend.friend_user_id != friend_user_id
        })
        friendsData.favorite = newFavorite

        // update in store
        yield put(friends(friendsData))
        yield call(removeFavoriteApi, user_id, friend_user_id)
    }
}

function checkFriendListsChanged(groups, numberFromStore, numberFromBackend, friendsData, rangeFriendLists) {
    const promise = []
    _.forEach(groups, (group) => {
        if(numberFromStore[group] != numberFromBackend[group]) {
            promise.push(
                fetchFriendLists(group, null).then((res) => {
                    friendsData[group] = _.get(res, 'data.data', [])
                })
            )
        }
    })
    return Promise.all(promise).then(() => {
        return friendsData
    })
}

function* updateFriendListsSaga() {
    while (true) {
        yield take('UPDATE_FRIEND_LISTS')
        const friendsData = yield select(getFriends)
        const rangeFriendLists = yield select(getRangeOfGroup)
        const numberFromStore = yield select(getNumberOfGroup)
        const numberFromBackend = yield call(fetchNumberOfGroup)

        const groups = yield select(getFriendGroups)

        const newFriendLists = yield call(checkFriendListsChanged, groups, numberFromStore, numberFromBackend, friendsData, rangeFriendLists)
        yield put(friends(newFriendLists))

        yield put(numberOfFriendLists(numberFromBackend))
    }
}

function* searchNewFriendSaga() {
    while (true) {
        const { payload: { userID }} = yield take('SEARCH_NEW_FRIEND')
        const resFetchFriendProfile = yield call(fetchFriendProfile, userID)
    }
}

const checkAuthAyncStorage = async (user_id) => {
    await AsyncStorage.setItem('user_id', user_id)
    return user_id
}

function* signin() {
    while (true) {
        const { payload: { username, password } } = yield take('SIGNIN')
        yield put(isLoading(true))
        if(username && password) {
            const res_loginApi = yield call(loginApi, username, password)

            console.log(' finsihed sign in ')
            console.log(res_loginApi)

            if(_.get(res_loginApi.data, 'error')) {
                yield put(signin_error(res_loginApi.data.error))
                yield put(isLoading(false))
                continue
            }
            const { data: { token, setting, user } } = res_loginApi
            yield put(authenticated(token, setting))
            yield put(signin_error(''))

            AsyncStorage.removeItem('user_id').then(() => {
                AsyncStorage.setItem('user_id', user.user_id)
            })

            yield put(enterContact())
            continue
        }
        yield put(signin_error('กรุณาระบุ Username เเละ Password'))
        yield put(isLoading(false))
    }
}

function* start_app() {
    while (true) {
        yield take('START_APP')
        const { data: { data }} = yield call(fetchLanguage)
        yield put(languages(data))
    }
}

function* signup() {
    while (true) {
        const { payload: { id, password, confirm_password, display_name, mobile_no, language_id } } = yield take('SIGNUP')
        if(id && password && confirm_password && display_name && mobile_no && language_id) {
            if(password != confirm_password) {
                yield put(signupEror('Password and Confirm password is not match!'))
                continue
            }
            const res_create_new_account = yield call(createNewAccount, id, password, display_name, mobile_no, language_id)

            console.log(' finsihed sign up')
            console.log(res_create_new_account)

            if(res_create_new_account.error) {
                yield put(signupEror(res_create_new_account.error))
                continue
            }
            const { data: { token, setting } } = res_create_new_account
            yield put(authenticated(token, setting, {}))

            const navigate = yield select(navigateSelector)
            const resetAction = NavigationActions.reset({
				index: 0,
				actions: [
					NavigationActions.navigate({ routeName: 'Login'})
				]
			})
			navigate.dispatch(resetAction)
            continue
        }
        yield put(signupEror('กรุณาระบุรายละเอียดให้ครบทุกช่อง'))
    }
}

const combinedFriends = (groups, rangeFriendLists, filter) => {
    let promises = []
    _.forEach(groups, (group) => {
        const promise = fetchFriendLists(group, rangeFriendLists[group], 0, filter)
        promises.push(promise)
    })
    return Promise.all(promises).then(values => {
        let friends = {}
        _.forEach(groups, (group, index) => {
            friends[group] = _.get(values[index], 'data.data', [])
        })
        return friends
    })
}



const fetchNumberOfGroup = (filter) => {
    return Promise.all([
        fetchFriendListCount('favorite', filter),
        fetchFriendListCount('group', filter),
        fetchFriendListCount('department', filter),
        fetchFriendListCount('other', filter)
    ]).then((res) => {
        return {
            favorite: res[0].data.total_number,
            group: res[1].data.total_number,
            department: res[2].data.total_number,
            other: res[3].data.total_number
        }
    })
}

function* enterContactSaga() {
    while (true) {
        yield take('ENTER_CONTACT')
        const filter = ''
        // fetch groups
        const resFetchFriendGroups = yield call(fetchFriendGroups)
        const friendGroupsData = _.get(resFetchFriendGroups, 'data.data')
        yield put(friendGroups(friendGroupsData))

        // fetch initial friend lists
        const rangeFriendLists = yield select(getRangeOfGroup)
        const friendsData = yield call(combinedFriends, friendGroupsData, rangeFriendLists, filter)
        yield put(friends(friendsData))

        // fetch user profile
        const resFetchMyProfile = yield call(fetchMyProfile)
        yield put(myprofile(_.get(resFetchMyProfile, 'data.data')))

        // fetch chat lists
        const resFetchChatLists = yield call(fetchChatLists)
        yield put(chatLists(_.get(resFetchChatLists, 'data.data', [])))

        // fetch number of friend lists
        const numberOfFriend = yield call(fetchNumberOfGroup, filter)
        yield put(numberOfFriendLists(numberOfFriend))

        const user_id = yield call(getAuth)

        // start socket after enter the contact
        start_socket(user_id)

        const sharedMsg = yield select(getSharedMessage)

        // if running on share message should go to RecieveMessage page
        let nextState = 'App'
        if(sharedMsg) {
            nextState = 'RecieveMessage'
        }

        // navigate to app
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: nextState})
            ]
        })
        console.log('[enterSplashSaga] navigate to ', nextState)

        yield put(isLoading(false))

        // use different navigation for avoiding duplicate pointer
        if(nextState=='RecieveMessage') {
            NavigationService.dispatch(resetAction)
        } else {
            const navigate = yield select(navigateSelector)
            navigate.dispatch(resetAction)
        }

        const resFetchKeepProfile = yield call(fetchKeepProfile)
        yield put(keepProfile(_.get(resFetchKeepProfile, 'data.data', '')))

        // fetch sticker
        yield put(onSticker())
    }
}

function* loadmoreSaga() {
    while (true) {
        const { payload: { group } } = yield take('ON_LOAD_MORE')
        try {
            //get all friends
            const friendsData = yield select(getFriends)
            const groupFriends = _.get(friendsData, group, [])

            // get filter
            const filter = yield select(getFilterFriend)

            // get range for each group
            const rangeFriendLists = yield select(getRangeOfGroup)
            const resFetchFriendLists = yield call(fetchFriendLists, group, null, groupFriends.length, filter)

            // add new list in old list
            friendsData[group] = friendsData[group].concat( _.get(resFetchFriendLists, 'data.data', []))

            // updatet
            yield put(friends(friendsData))
        } catch (err) {
            console.log('[loadmoreSaga] ', err)
        }
    }
}

function* logout() {
    while (true) {
        yield take('LOGOUT')

        yield call(logoutApi)

        const navigate = yield select(navigateSelector)
        AsyncStorage.removeItem('user_id')

        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Login'})
            ]
        })
        navigate.dispatch(resetAction)
    }
}

function* selectChatSaga() {
    while (true) {
        const { payload: { chatInfo }} = yield take('SELECT_CHAT')
        // fetch chat list from userID
        try {
            // navigate to chat page
            const navigate = yield select(navigateSelector)
            navigate.navigate('Chat', {
                display_name: chatInfo.display_name,
                chat_room_type: chatInfo.chat_room_type
            })

            if(!chatInfo.chat_room_id) {
                const resCreateNewRoom = yield call(createNewRoom, chatInfo.friend_user_id)
                chatInfo.chat_room_id = resCreateNewRoom.data.data.chat_room_id
            }

            const resFetchChat = yield call(fetchChat, chatInfo.chat_room_id, '', '', '')
            const chatData = _.get(resFetchChat, 'data.data', [])

            // store last id
            yield put(lastMessageID(chatData.length != 0? chatData[0].chat_message_id : '0'))

            // store data in store redux
            yield put(selectedChatInfo(chatInfo))
            yield put(chat(chatData))

            // subscribe socket io
            emit_subscribe(chatInfo.chat_room_id)

            // call set as setAsSeen
            if(chatData.length != 0) {
                yield call(setAsSeen, chatInfo.chat_room_id)
                emit_as_seen(chatInfo.chat_room_id)
            }
        } catch (err) {
            console.log('[selectChatSaga] ', err)
        }
    }
}

function* onFetchMessageListsSaga() {
    while (true) {
        const { payload: { filterMessage }} = yield take('ON_FETCH_MESSAGE_LISTS')
        try {
            const chatInfo = yield select(getChatInfo)

            const resFetchChat = yield call(fetchChat, chatInfo.chat_room_id, '', '', filterMessage)

            const chatData = _.get(resFetchChat, 'data.data', [])

            // store data in store redux
            yield put(chat(chatData))
        } catch (err) {
            console.log('[onFetchMessageListsSaga] ', err)
        }
    }
}

function* onLoadMoreMessageListsSaga() {
    while (true) {
        try {
            const { payload: { filterMessage }} = yield take('ON_LOAD_MORE_MESSAGE_LIST')

            const chatInfo = yield select(getChatInfo)
            const messageLists = yield select(getMessageLists)

            const topChatMessageId = _.get(messageLists[messageLists.length - 1], 'chat_message_id', '0')

            if(topChatMessageId != 0) {
                console.log(topChatMessageId)
                const resFetchChat = yield call(fetchChat, chatInfo.chat_room_id, topChatMessageId, '', filterMessage)
                const chatData = _.get(resFetchChat, 'data.data', [])

                const newMessageLists = messageLists.concat(chatData)

                yield put(chat(newMessageLists))
            }
        } catch (err) {
            console.log('[onLoadMoreMessageListsSaga] ', err)
        }
    }
}

function* onMuteChatSaga() {
    while (true) {
        try {
            yield take('ON_MUTE_CHAT')
            const chatRoomId = yield select(getSelectedActionChatRoomId)
            const resMuteChat = yield call(muteChat, chatRoomId)

            /** hide modal after click some event */
            yield put(onIsShowActionChat(false, ''))

            /** change status */
            const chatListsFromStore = yield select(getChatLists)

            for(let i = 0; i < chatListsFromStore.length; i++ ) {
                if(chatListsFromStore[i].chat_room_id == chatRoomId) {
                    chatListsFromStore[i].is_mute = '1'
                }
            }

            yield put(chatLists(chatListsFromStore))

            console.log(`[onMuteChatSaga] mute chat room id ${chatRoomId}`)
        } catch (err) {
            console.log('[onMuteChatSaga] ', err)
        }
    }
}

function* onUnmuteChatSaga() {
    while (true) {
        try {
            yield take('ON_UNMUTE_CHAT')
            const chatRoomId = yield select(getSelectedActionChatRoomId)
            const resUnMuteChat = yield call(unmuteChat, chatRoomId)

            /** hide modal after click some event */
            yield put(onIsShowActionChat(false, ''))

            /** change status */
            const chatListsFromStore = yield select(getChatLists)

            for(let i = 0; i < chatListsFromStore.length; i++ ) {
                if(chatListsFromStore[i].chat_room_id == chatRoomId) {
                    chatListsFromStore[i].is_mute = '0'
                }
            }

            yield put(chatLists(chatListsFromStore))

            console.log(`[onUnMuteChatSaga] unmute chat room id ${chatRoomId}`)
        } catch (err) {
            console.log('[onUnmuteChatSaga] ', err)
        }
    }
}

function* onHideChatSaga() {
    while (true) {
        try {
            yield take('ON_HIDE_CHAT')
            const chatRoomId = yield select(getSelectedActionChatRoomId)
            const resHideChat = yield call(hideChat, chatRoomId)

            /** hide modal after click some event */
            yield put(onIsShowActionChat(false, ''))

            console.log(`[onHideChatSaga] hide chat room id ${chatRoomId}`)


            const chatListsFromStore = yield select(getChatLists)

            const chatListsFilterHide = chatListsFromStore.filter((chat) => {
                return chatRoomId != chat.chat_room_id
            })
            yield put(chatLists(chatListsFilterHide))
        } catch (err) {
            console.log('[onHideChatSaga] ', err)
        }
    }
}

function* onBlockChatSaga() {
    while (true) {
        yield take('ON_BLOCK_CHAT')
        try {
            const chatRoomId = yield select(getSelectedActionChatRoomId)
            const resBlockChat = yield call(blockChat, chatRoomId)

            /** hide modal after click some event */
            yield put(onIsShowActionChat(false, ''))
            /** change status */
            const chatListsFromStore = yield select(getChatLists)
            for(let i = 0; i < chatListsFromStore.length; i++ ) {
                if(chatListsFromStore[i].chat_room_id == chatRoomId) {
                    chatListsFromStore[i].is_blocked = '1'
                }
            }

            yield put(chatLists(chatListsFromStore))

            console.log(`[onBlockChatSaga] block chat room id ${chatRoomId}`)
        } catch (err) {
            console.log('[onBlockChatSaga] ', err)
        }
    }
}

function* onUnblockChatSaga() {
    while (true) {
        yield take('ON_UNBLOCK_CHAT')
        try {
            const chatRoomId = yield select(getSelectedActionChatRoomId)
            const resUnBlockChat = yield call(unblockChat, chatRoomId)

            /** hide modal after click some event */
            yield put(onIsShowActionChat(false, ''))

            /** change status */
            const chatListsFromStore = yield select(getChatLists)

            for(let i = 0; i < chatListsFromStore.length; i++ ) {
                if(chatListsFromStore[i].chat_room_id == chatRoomId) {
                    chatListsFromStore[i].is_blocked = '0'
                }
            }

            yield put(chatLists(chatListsFromStore))

            console.log(`[onUnblockChatSaga] unblock chat room id ${chatRoomId}`)
        } catch (err) {
            console.log('[onUnblockChatSaga] ', err)
        }
    }
}

function* onDeleteChatSaga() {
    while (true) {
        yield take('ON_DELETE_CHAT')
        try {
            const chatRoomId = yield select(getSelectedActionChatRoomId)
            const resDeleteChat = yield call(deleteChat, chatRoomId)

            /** hide modal after click some event */
            yield put(onIsShowActionChat(false, ''))

            console.log(`[onDeleteChatSaga] delete chat room id ${chatRoomId}`)

            const chatListsFromStore = yield select(getChatLists)

            const chatListsFilterHide = chatListsFromStore.filter((chat) => {
                return chatRoomId != chat.chat_room_id
            })
            yield put(chatLists(chatListsFilterHide))
        } catch (err) {
            console.log('[onDeleteChatSaga] ', err)
        }
    }
}

function* onFetchInviteFriendSaga() {
    while (true) {
        const { payload: { inviteFriendSeachText } } = yield take('ON_FETCH_INVITE_FRIEND')
        try {
            const chatInfo = yield select(getChatInfo)
            const userInfo = yield select(getUserInfo)

            const resFetchInviteFriend = yield call(fetchInviteFriend, chatInfo.chat_room_id, userInfo.user_id, 0, 30, inviteFriendSeachText)

            yield put(inviteFriends(_.get(resFetchInviteFriend, 'data.data', [])))
        } catch (err) {
            console.log('[onFetchInviteFriendSaga] ', err)
        }
    }
}

function* loadMoreInviteFriendsSaga() {
    while (true) {
        const { payload : { page, inviteFriendSeachText } } = yield take('LOAD_MORE_INVITE_FRIENDS')
        try {
            const chatInfo = yield select(getChatInfo)
            const userInfo = yield select(getUserInfo)
            const inviteFriendsFromStore = yield select(getInviteFriendLists)
            const resFetchInviteFriend = yield call(fetchInviteFriend, chatInfo.chat_room_id, userInfo.user_id, inviteFriendsFromStore.data.length, 30, inviteFriendSeachText)
            const allInviteFriendLists = inviteFriendsFromStore.data.concat(_.get(resFetchInviteFriend, 'data.data.data', []))
            inviteFriendsFromStore.data = allInviteFriendLists
            yield put(inviteFriends(inviteFriendsFromStore))
        } catch (err) {
            console.log('[loadMoreInviteFriendsSaga] ', err)
        }
    }
}

function* inviteFriendToGroupSaga() {
    while (true) {
        const { payload: { chat_room_id, friend_user_id }} = yield take('ON_INVITE_FRIEND_TO_GROUP')
        try {
            const userInfo = yield select(getUserInfo)
            const inviteFriendLists = yield select(getInviteFriendLists)

            const resInviteFriendToGroup = yield call(inviteFriendToGroup, chat_room_id, friend_user_id)
            const newChatRoomId = resInviteFriendToGroup.data.data.new_chat_room_id

            const resFetchChatInfo = yield call(fetchChatInfo, newChatRoomId)

            const chatInfo = yield select(getChatInfo)

            if(chatInfo.chat_room_type == 'G' || chatInfo.chat_room_type == 'C') {
                inviteFriendLists.data.forEach((friend, index) => {
                    if(inviteFriendLists.data[index].friend_user_id == friend_user_id) {
                        inviteFriendLists.data[index].status_quote = 'Invited. (Tap to remove)'
                        inviteFriendLists.data[index].invited = true
                    }
                })
                yield put(inviteFriends(inviteFriendLists))

                // update own
                emit_update_friend_chat_list(userInfo.user_id, userInfo.user_id)

                // update chat list
                emit_update_friend_chat_list(userInfo.user_id, friend_user_id)

                const split = chatInfo.friend_user_ids.split(',')
                split.push(`${friend_user_id}`)
                const newFriendUserIds = split.join(',')

                chatInfo.friend_user_ids = newFriendUserIds
                yield put(selectedChatInfo(chatInfo))

                // update friend_user_ids in friend lists
                const friendLists = yield select(getFriends)
                friendLists.group = friendLists.group.map((friend) => {
                    if(chatInfo.chat_room_id == friend.chat_room_id) {
                        friend.friend_user_ids = newFriendUserIds
                    }
                    return friend
                })

                yield put(friends(friendLists))

                // update friend_user_ids in chat lists
                const chatListsFromStore = yield select(getChatLists)
                const chatListsForSaveToStore = chatListsFromStore.map((chat) => {
                    if(chatInfo.chat_room_id == chat.chat_room_id) {
                        chat.friend_user_ids = newFriendUserIds
                    }
                    return chat
                })

                yield put(chatLists(chatListsForSaveToStore))
            } else {
                const navigate = yield select(navigateSelector)
                navigate.dispatch(NavigationActions.back())

                const cInfo = resFetchChatInfo.data.data
                cInfo.friend_user_ids = `${cInfo.friend_user_ids},${chatInfo.friend_user_id}`
                yield put(selectChat(resFetchChatInfo.data.data))

                // add owner friend to new group room
                yield call(inviteFriendToGroup, newChatRoomId, chatInfo.friend_user_id)

                // update own
                emit_update_friend_chat_list(userInfo.user_id, userInfo.user_id)

                // update chat list
                emit_update_friend_chat_list(userInfo.user_id, friend_user_id)
                emit_update_friend_chat_list(userInfo.user_id, chatInfo.friend_user_id)

                // update friend groups
                yield put(onUpdateGroupLists())
            }

            continue
        } catch (err) {
            console.log('[inviteFriendToGroupSaga] ', err)
        }
    }
}

function* removeFriendFromGroupSaga() {
    while (true) {
        const { payload: { chat_room_id, friend_user_id, is_from_member_modal }} = yield take('REMOVE_FRIEND_FROM_GROUP')
        try {
            const resRemoveFriendFromGroup = yield call(removeFriendFromGroup, chat_room_id, friend_user_id)
            const userInfo = yield select(getUserInfo)
            const chatInfo = yield select(getChatInfo)

            if(chatInfo.chat_room_type == 'G' || chatInfo.chat_room_type == 'C') {
                if (!is_from_member_modal) {
                    const inviteFriendLists = yield select(getInviteFriendLists)
                    inviteFriendLists.data.forEach((friend, index) => {
                        if(inviteFriendLists.data[index].friend_user_id == friend_user_id) {
                            inviteFriendLists.data[index].status_quote = 'Tap to invite'
                            inviteFriendLists.data[index].invited = false
                        }
                    })
                    yield put(inviteFriends(inviteFriendLists))
                } else {
                    const member = yield select(getMemberInGroup)
                    member.data = member.data.filter((friend) => {
                        return friend.friend_user_id != friend_user_id
                    })
                    yield put(memberInGroup(member))
                }

                // update own
                emit_update_friend_chat_list(userInfo.user_id, userInfo.user_id)
                // update chat list
                emit_update_friend_chat_list(userInfo.user_id, friend_user_id)

                const split = chatInfo.friend_user_ids.split(',')
                const filter = split.filter((id) => id != friend_user_id)
                const join = filter.join(',')
                const newFriendUserIds = join

                chatInfo.friend_user_ids = newFriendUserIds
                yield put(selectedChatInfo(chatInfo))

                // update friend_user_ids in friend lists
                const friendLists = yield select(getFriends)
                friendLists.group = friendLists.group.map((friend) => {
                    if(chatInfo.chat_room_id == friend.chat_room_id) {
                        friend.friend_user_ids = newFriendUserIds
                    }
                    return friend
                })

                yield put(friends(friendLists))

                // update friend_user_ids in chat lists
                const chatListsFromStore = yield select(getChatLists)
                const chatListsForSaveToStore = chatListsFromStore.map((chat) => {
                    if(chatInfo.chat_room_id == chat.chat_room_id) {
                        chat.friend_user_ids = newFriendUserIds
                    }
                    return chat
                })

                yield put(chatLists(chatListsForSaveToStore))
            }
        } catch (err) {
            console.log('[removeFriendFromGroupSaga] ', err)
        }
    }
}

function* onExitTheGroupSaga() {
    while (true) {
        const { payload: { chat_room_id }} = yield take('ON_EXIT_THE_GROUP')
        try {
            yield call(exitTheGroup, chat_room_id)

            const userInfo = yield select(getUserInfo)

            const navigate = yield select(navigateSelector)

            navigate.dispatch(NavigationActions.back())

            // update chat list
            const resFetchChatLists = yield call(fetchChatLists)
            yield put(chatLists(_.get(resFetchChatLists, 'data.data', [])))

            // update friend groups
            yield put(onUpdateGroupLists())
        } catch (err) {
            console.log('[onExitTheGroupSaga] ', err)
        }
    }
}

function* onFetchFriendInGroupSaga() {
    while (true) {
        const { payload: { query } } = yield take('ON_FETCH_FRIEND_IN_GROUP')
        try {
            // clear friend in member from store
            yield put(memberInGroup([]))

            const chatInfo = yield select(getChatInfo)

            const resFriendInGroup = yield call(friendInGroup, chatInfo.chat_room_id, 0, 20, query)

            yield put(memberInGroup(_.get(resFriendInGroup, 'data.data', [])))
        } catch (err) {
            console.log('[onFetchFriendInGroupSaga] ', err)
        }
    }
}

function* onLoadMoreMemberInGroupSaga() {
    while (true) {
        const { payload : { query } } = yield take('ON_LOAD_MORE_MEMBER_IN_GROUP')
        try {
            const chatInfo = yield select(getChatInfo)
            const userInfo = yield select(getUserInfo)

            const memberFromStore = yield select(getMemberInGroup)
            const resFriendInGroup = yield call(friendInGroup, chatInfo.chat_room_id, memberFromStore.data.length, 20, query)
            const allMember = memberFromStore.data.concat(_.get(resFriendInGroup, 'data.data.data', []))

            memberFromStore.data = allMember
            yield put(memberInGroup(memberFromStore))
        } catch (err) {
            console.log('[onLoadMoreMemberInGroupSaga] ', err)
        }
    }
}

function* onEnterOptionMessageSaga() {
    while (true) {
        yield take('ON_ENTER_OPTION_MESSAGE')
        try {
            const chatInfo = yield select(getChatInfo)
            const resFetchChat = yield call(fetchChat, chatInfo.chat_room_id, '', '', '')

            const chatData = _.get(resFetchChat, 'data.data', [])

            // store data in store redux
            yield put(optionMessage(chatData))
        } catch (err) {
            console.log('[onEnterOptionMessageSaga] ', err)
        }
    }
}

function* updateProfileSaga() {
    while (true) {
        const { payload: { profile, pic_base64 }} = yield take('ON_UPDATE_PROFILE')
        try {
            const userInfo = yield select(getUserInfo)

            // update profile with api
            yield call(updateProfile, profile)

            // update picture profile
            if(!_.get(pic_base64, 'profile_pic_base64', false)) {
                delete pic_base64.profile_pic_base64
            }
            if(!_.get(pic_base64, 'wall_pic_base64', false)) {
                delete pic_base64.wall_pic_base64
            }

            if(_.get(pic_base64, 'profile_pic_base64', false) || _.get(pic_base64, 'wall_pic_base64', false)) {
                yield call(updatePictureAuth, pic_base64)
            }

            // nagigate back
            const navigate = yield select(navigateSelector)
            navigate.dispatch(NavigationActions.back())

            // fetch user profile
            const resFetchMyProfile = yield call(fetchMyProfile)
            yield put(myprofile(_.get(resFetchMyProfile, 'data.data')))
        } catch (err) {
            console.log('[updateProfileSaga] ', err)
        }
    }
}

function* onLoadMoreOptionMessageSaga() {
    while (true) {
        yield take('ON_LOAD_MORE_OPTION_MESSAGE')
        try {
            const chatInfo = yield select(getChatInfo)

            const messageLists = yield select(getOptionMessageLists)

            const topChatMessageId = _.get(messageLists[messageLists.length - 1], 'chat_message_id', '0')

            const resFetchChat = yield call(fetchChat, chatInfo.chat_room_id, topChatMessageId, '', '')
            const chatData = _.get(resFetchChat, 'data.data', [])

            const newMessageLists = messageLists.concat(chatData)

            yield put(optionMessage(newMessageLists))
        } catch (err) {
            console.log('[onLoadMoreOptionMessageSaga] ', err)
        }
    }
}

function* onInviteFriendToGroupWithOpenCaseSaga() {
    while (true) {
        const { payload: { chat_room_id, selected_invite_friend_user_id, selected_option_message_id }} = yield take('ON_INVITE_FRIEND_TO_GROUP_WITH_OPEN_CASE')
        try {
            const userInfo = yield select(getUserInfo)
            const chatInfo = yield select(getChatInfo)

            const resInviteFriendToGroup = yield call(inviteFriendToGroupWithOpenCase, {
                chat_room_id: chat_room_id,
                user_id: userInfo.user_id,
                friend_user_id: chatInfo.friend_user_id,
                chat_message_ids: selected_option_message_id
            })
            const newChatRoomId = resInviteFriendToGroup.data.new_chat_room_id
            const displayName = resInviteFriendToGroup.data.room_name

            // add owner friend to new group room
            yield call(inviteFriendToGroup, newChatRoomId, selected_invite_friend_user_id)

            const resFetchChatInfo = yield call(fetchChatInfo, newChatRoomId)

            const navigate = yield select(navigateSelector)
            navigate.dispatch(NavigationActions.back())

            yield put(selectChat(resFetchChatInfo.data.data))

            // update own
            emit_update_friend_chat_list(userInfo.user_id, userInfo.user_id)

            // update chat list
            emit_update_friend_chat_list(userInfo.user_id, selected_invite_friend_user_id)
            emit_update_friend_chat_list(userInfo.user_id, chatInfo.friend_user_id)

            // update friend groups
            yield put(onUpdateGroupLists())
            continue
        } catch (err) {
            console.log('[onInviteFriendToGroupWithOpenCaseSaga] ', err)
        }
    }
}


function* enterSplashSaga() {
    while (true) {
        yield take('ENTER_SPLASH')
        console.log('[enterSplashSaga] start app')
        const user_id = yield call(getAuth)

        const navigate = yield select(navigateSelector)

        if(user_id) {
            yield put(enterContact())
            continue
        } else {
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Login'})
                ]
            })
            console.log('[enterSplashSaga] navigate to Login')
            navigate.dispatch(resetAction)
            continue
        }
    }
}

function* onRecieveShareMessageSaga() {
    while (true) {
        const { payload: { sharedMsg }} = yield take('ON_RECIEVE_SHARE_MESSAGE')

        yield put(sharedMessage(sharedMsg))

        const user_id = yield call(getAuth)

        const navigate = yield select(navigateSelector)

        if(user_id) {
            yield put(enterContact())
            continue
        } else {
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Login'})
                ]
            })
            console.log('[enterSplashSaga] navigate to Login')
            NavigationService.dispatch(resetAction)
            continue
        }
    }
}

function* onForwardSaga() {
    while (true) {
        const { payload: { data }} = yield take('ON_FORWARD')

        yield put(sharedMessage(data))

        // navigate to chat page
        const navigate = yield select(navigateSelector)
        navigate.navigate('RecieveMessage', {
            isForward: true
        })
    }
}

function* onUpdateGroupListsSaga() {
    while (true) {
        yield take('ON_UPDATE_GROUP_LISTS')
        const friendLists = yield select(getFriends)
        const friendInGroup = yield call(fetchFriendLists, 'group', friendLists.group.length, 0, '')
        friendLists.group = _.get(friendInGroup, 'data.data', [])

        yield put(friends(friendLists))

        // fetch number of friend lists
        const numberOfFriend = yield call(fetchNumberOfGroup, '')
        yield put(numberOfFriendLists(numberOfFriend))
    }
}

function* onUpdateGroupSettingSaga() {
    while (true) {
        const { payload: { data }} = yield take('ON_UPDATE_GROUP_SETTING')

        // update in friend lists
        const friendLists = yield select(getFriends)
        friendLists.group = friendLists.group.map((friend) => {
            if(data.chat_room_id == friend.chat_room_id) {
                friend.wall_pic_url = data.wall_pic_url
                friend.profile_pic_url = data.profile_pic_url
                friend.c_hn = data.hn
                friend.c_patient_name = data.patient_name
                friend.c_description = data.description
                friend.display_name = data.display_name
            }
            return friend
        })

        yield put(friends(friendLists))

        // update in chat lists
        const chatListsFromStore = yield select(getChatLists)
        const chatListsForSaveToStore = chatListsFromStore.map((chat) => {
            if(data.chat_room_id == chat.chat_room_id) {
                chat.friend_wall_pic_url = data.wall_pic_url
                chat.profile_pic_url = data.profile_pic_url
                chat.hn = data.hn
                chat.patient_name = data.patient_name
                chat.description = data.description
                chat.display_name = data.display_name
            }
            return chat
        })

        yield put(chatLists(chatListsForSaveToStore))
    }
}

function* onSelectKeepSaga() {
    while (true) {
        yield take('ON_SELECT_KEEP')

        const kProfile = yield select(getKeepProfile)
        yield put(selectChat(kProfile))
    }
}

export function* rootSaga() {
    yield all([
        signin(),
        start_app(),
        signup(),
        enterContactSaga(),
        searchNewFriendSaga(),
        addFavoriteSaga(),
        removeFavoriteSaga(),
        updateFriendListsSaga(),
        loadmoreSaga(),
        onSearchFriendSata(),
        logout(),
        selectChatSaga(),
        onStickerSaga(),
        onLoadMoreMessageListsSaga(),
        onMuteChatSaga(),
        onHideChatSaga(),
        onBlockChatSaga(),
        onDeleteChatSaga(),
        onUnblockChatSaga(),
        onUnmuteChatSaga(),
        onFetchInviteFriendSaga(),
        loadMoreInviteFriendsSaga(),
        inviteFriendToGroupSaga(),
        removeFriendFromGroupSaga(),
        onExitTheGroupSaga(),
        onFetchFriendInGroupSaga(),
        onLoadMoreMemberInGroupSaga(),
        onEnterOptionMessageSaga(),
        updateProfileSaga(),
        onLoadMoreOptionMessageSaga(),
        onInviteFriendToGroupWithOpenCaseSaga(),
        enterSplashSaga(),
        onFetchMessageListsSaga(),
        onRecieveShareMessageSaga(),
        onForwardSaga(),
        onUpdateGroupListsSaga(),
        onUpdateGroupSettingSaga(),
        onSelectKeepSaga()
    ])
}
