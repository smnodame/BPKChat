import _ from "lodash"
import { all, call, put, takeEvery, takeLatest, take, select } from 'redux-saga/effects'
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
    chat
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
    fetchChat
} from './api'
import {
    getFriendGroups,
    getFriends,
    getNumberOfGroup,
    getRangeOfGroup,
    getFilterFriend,
    navigateSelector
} from './selectors'

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
                fetchFriendLists(group, rangeFriendLists[group]).then((res) => {
                    friendsData[group] = _.get(res, 'data.data', [])
                })
            )
        }
    })
    return Promise.all(promise).then(() => {
        return friendsData
    })
}

function* refreshNumberOfFriendLists() {
    while (true) {

    }
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
        console.log(newFriendLists)
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

function* signin() {
    while (true) {
        const { payload: { username, password } } = yield take('SIGNIN')
        if(username && password) {
            const res_loginApi = yield call(loginApi, username, password)
            if(_.get(res_loginApi.data, 'error')) {
                yield put(signin_error(res_loginApi.data.error))
                continue
            }
            const { data: { token, setting, user } } = res_loginApi
            yield put(authenticated(token, setting))

            yield put(signin_error(''))

            const navigate = yield select(navigateSelector)

            const resetAction = NavigationActions.reset({
				index: 0,
				actions: [
					NavigationActions.navigate({ routeName: 'App'})
				]
			})
			navigate.dispatch(resetAction)
            continue
        }
        yield put(signin_error('กรุณาระบุ Username เเละ Password'))
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
        console.log(id, password, confirm_password, display_name, mobile_no, language_id)
        if(id && password && confirm_password && display_name && mobile_no && language_id) {
            if(password != confirm_password) {
                yield put(signupEror('Password and Confirm password is not match!'))
                continue
            }
            const res_create_new_account = yield call(createNewAccount, id, password, display_name, mobile_no, language_id)
            if(res_create_new_account.error) {
                yield put(signupEror(res_create_new_account.error))
                continue
            }
            const { data: { token, setting } } = res_create_new_account
            yield put(authenticated(token, setting, {}))
            yield put(NavigationActions.navigate({ routeName: 'Login' }))
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
        console.log(res)
        return {
            favorite: res[0].data.total_number,
            group: res[1].data.total_number,
            department: res[2].data.total_number,
            other: res[3].data.total_number
        }
    })
}

function* enterContacts() {
    while (true) {
        yield take('ENTER_CONTACTS')
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
        yield put(chatLists(_.get(resFetchChatLists, 'data.data')))

        // fetch number of friend lists
        const numberOfFriend = yield call(fetchNumberOfGroup, filter)
        yield put(numberOfFriendLists(numberOfFriend))
    }
}

function* loadmoreSaga() {
    while (true) {
        const { payload: { group } } = yield take('ON_LOAD_MORE')

        //get all friends
        const friendsData = yield select(getFriends)
        const groupFriends = _.get(friendsData, group, [])

        // get filter
        const filter = yield select(getFilterFriend)

        // get range for each group
        const rangeFriendLists = yield select(getRangeOfGroup)
        const resFetchFriendLists = yield call(fetchFriendLists, group, groupFriends.length + rangeFriendLists[group], groupFriends.length, filter)

        // add new list in old list
        friendsData[group] = friendsData[group].concat( _.get(resFetchFriendLists, 'data.data', []))

        // updatet
        yield put(friends(friendsData))
    }
}

function* logout() {
    while (true) {
        yield take('LOGOUT')

        const navigate = yield select(navigateSelector)

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
            const resFetchChat = yield call(fetchChat, chatInfo.chat_room_id)
            const chatData = _.get(resFetchChat, 'data.data', [])

            // store data in store redux
            yield put(selectedChatInfo(chatInfo))
            yield put(chat(chatData))

            // navigate to chat page
            const navigate = yield select(navigateSelector)
            navigate.navigate('Chat')
        } catch (err) {

            console.log(err)
        }
    }
}

export default function* rootSaga() {
    yield all([
        signin(),
        start_app(),
        signup(),
        enterContacts(),
        searchNewFriendSaga(),
        addFavoriteSaga(),
        removeFavoriteSaga(),
        updateFriendListsSaga(),
        loadmoreSaga(),
        onSearchFriendSata(),
        logout(),
        selectChatSaga()
    ])
}
