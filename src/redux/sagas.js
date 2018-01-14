import _ from "lodash"
import axios from "axios"

import { all, call, put, takeEvery, takeLatest, take, select } from 'redux-saga/effects'
import { numberOfFriendLists, signin_error, languages, authenticated, friendGroups, updateFriendLists, friends, myprofile, signupEror, searchNewFriend, chatLists } from './actions'
import { NavigationActions } from 'react-navigation'

function login_api(username, password) {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/check_login?user_id=${username}&password=${password}`)
}

function fetch_language() {
    return axios.get('http://itsmartone.com/bpk_connect/api/user/language_list')
}

const getFriendGroups = state => {
    return state.friend.friendGroups
}

function create_new_account(id, password, display_name, mobile_no, language) {
    return axios.post('http://itsmartone.com/bpk_connect/api/user/register', {
        username: id,
        password,
        display_name,
        mobile_no,
        user_language_id: language
    })
}

function fetchFriendGroups() {
    return axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_type_list')
}

function fetchFriendLists(group, range, start = 0) {
    return axios.get(`http://itsmartone.com/bpk_connect/api/friend/friend_list?token=asdf1234aaa&user_id=3963&start=${start}&limit=${range}&filter=&friend_type=${group}`)
}

function fetchFriendProfile(userID) {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/data/${userID}`)
}

const getFriends = (state) => {
    return state.friend.friends
}

const updateProfileImage = () => {
    return axios.post(`http://itsmartone.com/bpk_connect/api/group/update_picture`, {
        token: 'asdf1234aaa',
    })
}

function addFavoriteApi(user_id, friend_user_id) {
    return axios.post('http://itsmartone.com/bpk_connect/api/friend/add_fav', {
        token: 'asdf1234aaa',
        user_id,
        friend_user_id
    })
}

function removeFavoriteApi(user_id, friend_user_id) {
    return axios.post('http://itsmartone.com/bpk_connect/api/friend/remove_fav', {
        token: 'asdf1234aaa',
        user_id,
        friend_user_id
    })
}

const getNumberOfGroup = state => {
    return state.friend.numberOfFriendLists
}

const getRangeOfGroup = state => {
    return state.friend.rangeFriendLists
}

function* addFavoriteSaga() {
    while (true) {
        const { payload: { user_id, friend_user_id, friend_data }} = yield take('ADD_FAVORITE')
        const friendsData = yield select(getFriends)
        friendsData.favorite.push(friend_data)
        yield put(friends(friendsData))
        yield call(addFavoriteApi, user_id, friend_user_id)
    }
}

function* removeFavoriteSaga() {
    while (true) {
        const { payload: { user_id, friend_user_id }} = yield take('REMOVE_FAVORITE')
        const friendsData = yield select(getFriends)
        const favorite = _.get(friendsData, 'favorite', [])
        const newFavorite = favorite.filter((friend) => {
            return friend.friend_user_id != friend_user_id
        })
        friendsData.favorite = newFavorite
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
            const res_login_api = yield call(login_api, username, password)
            if(_.get(res_login_api.data, 'error')) {
                yield put(signin_error(res_login_api.data.error))
                continue
            }
            const { data: { token, setting, user } } = res_login_api
            yield put(authenticated(token, setting))

            yield put(NavigationActions.navigate({ routeName: 'App' }))
            continue
        }
        yield put(signin_error('กรุณาระบุ Username เเละ Password'))
    }
}

function* start_app() {
    while (true) {
        yield take('START_APP')
        const { data: { data }} = yield call(fetch_language)
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
            const res_create_new_account = yield call(create_new_account, id, password, display_name, mobile_no, language_id)
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

const combinedFriends = (groups, rangeFriendLists) => {
    let promises = []
    _.forEach(groups, (group) => {
        const promise = fetchFriendLists(group, rangeFriendLists[group])
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

const fetchMyProfile = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/user/my_profile?token=asdf1234aaa&user_id=3963')
}

const fetchChatLists = () => {
    return axios.get('http://itsmartone.com/bpk_connect/api/chat/chat_list?token=asdf1234aaa&user_id=3963&start=0&limit=20')
}

const fetchNumberOfGroup = () => {
    return Promise.all([
        axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_list_count?token=asdf1234aaa&user_id=3963&friend_type=favorite&filter='),
        axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_list_count?token=asdf1234aaa&user_id=3963&friend_type=group&filter='),
        axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_list_count?token=asdf1234aaa&user_id=3963&friend_type=department&filter='),
        axios.get('http://itsmartone.com/bpk_connect/api/friend/friend_list_count?token=asdf1234aaa&user_id=3963&friend_type=other&filter=')
    ]).then((res) => {
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
        // fetch groups
        const resFetchFriendGroups = yield call(fetchFriendGroups)
        const friendGroupsData = _.get(resFetchFriendGroups, 'data.data')
        yield put(friendGroups(friendGroupsData))
        //
        // fetch initial friend lists
        const rangeFriendLists = yield select(getRangeOfGroup)
        const friendsData = yield call(combinedFriends, friendGroupsData, rangeFriendLists)
        yield put(friends(friendsData))

        // fetch user profile
        const resFetchMyProfile = yield call(fetchMyProfile)
        yield put(myprofile(_.get(resFetchMyProfile, 'data.data')))

        // fetch chat lists
        const resFetchChatLists = yield call(fetchChatLists)
        yield put(chatLists(_.get(resFetchChatLists, 'data.data')))

        // fetch number of friend lists
        const numberOfFriend = yield call(fetchNumberOfGroup)
        yield put(numberOfFriendLists(numberOfFriend))
    }
}

function* loadmoreSaga() {
    while (true) {
        const { payload: { group } } = yield take('ON_LOAD_MORE')

        const friendsData = yield select(getFriends)
        const groupFriends = _.get(friendsData, group, [])

        const rangeFriendLists = yield select(getRangeOfGroup)
        const resFetchFriendLists = yield call(fetchFriendLists, group, groupFriends.length + rangeFriendLists[group], groupFriends.length)
        console.log(resFetchFriendLists)
        friendsData[group] = friendsData[group].concat( _.get(resFetchFriendLists, 'data.data', []))
        yield put(friends(friendsData))
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
        loadmoreSaga()
    ])
}
