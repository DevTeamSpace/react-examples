import {take, call, put, select, cancel, takeLatest, takeEvery} from 'redux-saga/effects';
import {LOCATION_CHANGE} from 'react-router-redux';
import {normalize} from 'normalizr';
import {browserHistory} from 'react-router';

import * as schemas from '../App/schemas';
import {
  CHATS_LOAD,
  MESSAGES_LOAD,
  MESSAGE_SEND,
  MESSAGE_GET_FROM_SOCKET,
  CHATS_SEARCH,
} from './constants';
import {
  loadChats,
  loadedChats,
  loadChatsError,
  loadedMessages,
  sendedMessages,
  loadMessages,
  messageSaveFromSocket,
  saveChats,
  preSendedMessages,
  errorSendMessage,
} from './actions';
import request, {toQueryString} from 'utils/request';

export const getState = (state) => state;

/**
 * Load people
 */
export function* getChats(action) {
  const state = yield select(getState);
  const auth = yield state.get('global').auth;
  const url = '/chats';
  let url_get_users = '/users/search?';
  const options = {method: 'get'};

  try {
    const responseChats = yield call(request, url, options, auth);
    const chatList = responseChats.data.map(item => {
      item.id = auth.user.user_id.toString() === item.user_id_to.toString() ? item.user_id_from : item.user_id_to;
      item.messages = [];
      return item
    });
    const chatListNorm = normalize(chatList, schemas.arrayOfChats);
    url_get_users += chatListNorm.result.map((item, i) => {
      return `ids[${i}]=${item}`
    }).join('&');
    const responseUsers = yield call(request, url_get_users, options, auth);
    const usersListNorm = normalize(responseUsers.data, schemas.arrayOfUsers);
    yield put(loadedChats(chatListNorm, usersListNorm.entities.users));
    if (action.id)
      yield put (loadMessages(action.id));
    if (!action.id && chatListNorm.result[0])
      browserHistory.push(`/messages/${chatListNorm.result[0]}`);
  } catch (error) {
    console.log('Chat saga error', error)
  }
}

export function* getMessages(action) {
  const state = yield select(getState);
  const auth = yield state.get('global').auth;
  const url = `/chats/messages?user_id=${action.id}`;
  const options = { method: 'get' };
  const visitUrl = '/chats/visit';
  const visitOptions = { method: 'post', body: JSON.stringify({ user_id: action.id }) };

  try {
    const response = yield call(request, url, options, auth);
    const visitResponse = yield call(request, visitUrl, visitOptions, auth);
    yield put(loadedMessages(response.data, action.id));
  } catch (error) {
    console.log('Chat saga error', error)
  }
}

export function* sendMessage(action) {
  const state = yield select(getState);
  const auth = yield state.get('global').auth;
  const date = new Date().toISOString();
  yield put(preSendedMessages({
    user_id_to: action.id,
    user_id_from: auth.user.user_id,
    message: action.message,
    created_at: date,
    unconfirm: true
  }));
  const url = '/chats/messages';
  const options = {
    method: 'post',
    body: JSON.stringify({message: action.message, user_id: action.id})
  };
  const visitUrl = '/chats/visit';
  const visitOptions = { method: 'post', body: JSON.stringify({ user_id: action.id }) };

  yield new Promise((resolve, reject) => {
         setTimeout(() => {
            resolve(true)
      }, 2500)
   });

  try {
    // const response = yield call(request, url, options, auth);
    // const visitResponse = yield call(request, visitUrl, visitOptions, auth);
    yield put(sendedMessages({
      user_id_to: action.id,
      user_id_from: auth.user.user_id,
      message: action.message,
      created_at: date
    }));
  } catch (error) {
    yield put(errorSendMessage({
      user_id_to: action.id,
      user_id_from: auth.user.user_id,
      message: action.message,
      created_at: date
    }));
    console.log('Chat saga error', error)
  }
}

export function* getMessageFromSocket(action) {
  const state = yield select(getState);
  const auth = yield state.get('global').auth;
  // проверка на наличие в списке чата с пользователем из сокета, и если нет то взять информацию о нем и добавить в entities и создать чат
  yield put(messageSaveFromSocket({
    created_at: action.message.created_at,
    user_id_from: action.message.user_id,
    user_id_to: parseInt(auth.user.user_id, 10),
    message: action.message.short
  }));
}

export function* searchChats(action) {
  const state = yield select(getState);
  const auth = yield state.get('global').auth;
  if (action.text.length) {
    const urlFriends = `/users/search?match=${action.text}&by_name=1&in_contacts=1`;
    const urlUsers = `/users/search?match=${action.text}&by_name=1`;
    const options = {method: 'get'};
    try {
      const responseFriends = yield call(request, urlFriends, options, auth);
      const responseUsers = yield call(request, urlUsers, options, auth);
      const friends = normalize(responseFriends.data, schemas.arrayOfUsers);
      const users = normalize(responseUsers.data, schemas.arrayOfUsers);
      yield put(saveChats(friends, users));
    } catch (error) {
      console.log('Chat saga error', error)
    }
  }
  else {
    const friends = normalize([], schemas.arrayOfUsers);
    const users = normalize([], schemas.arrayOfUsers);
    yield put(saveChats(friends, users));
  }
}

export function* watchChatsLoad() {
  const watcher = yield takeLatest(CHATS_LOAD, getChats);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* watchMessagesLoad() {
  const watcher = yield takeLatest(MESSAGES_LOAD, getMessages);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* watchSendMessage() {
  const watcher = yield takeEvery(MESSAGE_SEND, sendMessage);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* watchGetMessageFromSocket() {
  const watcher = yield takeLatest(MESSAGE_GET_FROM_SOCKET, getMessageFromSocket);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* watchSearchChats() {
  const watcher = yield takeLatest(CHATS_SEARCH, searchChats);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export default [
  watchChatsLoad,
  watchMessagesLoad,
  watchSendMessage,
  watchGetMessageFromSocket,
  watchSearchChats,
];
