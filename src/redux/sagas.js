import _ from "lodash"
import axios from "axios"

import { all, call, put, takeEvery, takeLatest, take } from 'redux-saga/effects'
import { signInError } from './actions'
import { NavigationActions } from 'react-navigation'

function loginApi(username, password) {
    return axios.get('http://itsmartone.com/bpk_connect/api/user/check_login?user_id=test1&password=1111')
}

function* signin() {
    while (true) {
        const { payload: { username, password } } = yield take('SIGNIN')
        if(username && password) {
            const resLoginApi = yield call(loginApi, username, password)
            if(_.get(resLoginApi.data, 'error')) {
                yield put(signInError(resLoginApi.data.error))
                continue
            }
            yield put(NavigationActions.navigate({ routeName: 'App' }))
            continue
        }
        yield put(signInError('กรุณาระบุ Username เเละ Password'))
    }
}

export default function* rootSaga() {
    yield all([
        signin()
    ])
}
