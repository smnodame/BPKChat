import { all, call, put, takeEvery, takeLatest, take } from 'redux-saga/effects'

// Our worker Saga: will perform the async increment task
function* signin() {
    while (true) {
        yield take('SIGNIN')
        yield put({
            type: 'AUTHENTICATED',
            payload: {
                token: '1234',
                expire: '10/12/58'
            }
        })
    }
}

// single entry point to start all Sagas at once
export default function* rootSaga() {
    yield all([
        signin()
    ])
}
