import _ from "lodash"
import axios from "axios"

import { all, call, put, takeEvery, takeLatest, take, select } from 'redux-saga/effects'
import { signin_error, languages, authenticated, friendGroups, friends, myprofile, signupEror, searchNewFriend } from './actions'
import { NavigationActions } from 'react-navigation'

function login_api(username, password) {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/check_login?user_id=${username}&password=${password}`)
}

function fetch_language() {
    return axios.get('http://itsmartone.com/bpk_connect/api/user/language_list')
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

function fetchFriendLists(group) {
    return axios.get(`http://itsmartone.com/bpk_connect/api/friend/friend_list?token=asdf1234aaa&user_id=3963&start=0&limit=15&filter=&friend_type=${group}`)
}

function fetchFriendProfile(userID) {
    return axios.get(`http://itsmartone.com/bpk_connect/api/user/data/${userID}`)
}

function* searchNewFriendSaga() {
    while (true) {
        const { payload: { userID }} = yield take('SEARCH_NEW_FRIEND')
        const resFetchFriendProfile = yield call(fetchFriendProfile, userID)
        console.log('==============')
        console.log(resFetchFriendProfile)
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

const getFriendGroups = state => {
    return state.friend.friendGroups
}

const combinedFriends = (groups) => {
    let promises = []
    _.forEach(groups, (group) => {
        const promise = fetchFriendLists(group)
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

function* enterContacts() {
    while (true) {
        yield take('ENTER_CONTACTS')
        const resFetchFriendGroups = yield call(fetchFriendGroups)
        const friendGroupsData = _.get(resFetchFriendGroups, 'data.data')
        yield put(friendGroups(friendGroupsData))
        const friendsData = yield call(combinedFriends, friendGroupsData)
        yield put(friends(friendsData))
        const resFetchMyProfile = yield call(fetchMyProfile)
        yield put(myprofile(_.get(resFetchMyProfile, 'data.data')))

    }
}

export default function* rootSaga() {
    yield all([
        signin(),
        start_app(),
        signup(),
        enterContacts(),
        searchNewFriendSaga()
    ])
}
