import React, { Component, PropTypes } from 'react';
import AvatarSrc from '../../static/img/avatar_default.png';
import { Link } from 'react-router';
import { searchChat } from '../containers/Chat/actions';
import SearchListUser from '../components/SearchListUser';
import SearchListChat from '../components/SearchListChat';
import { Scrollbars } from 'react-custom-scrollbars';
import { debounce } from 'lodash';

export default class ChatMenu extends React.Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.state = {
      searchText: ''
    };
    this.searchUser = _.debounce(this.searchUser, 500);
  }

  static propTypes = {
    auth: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

  searchUser = (text, chats) => {
    this.props.dispatch(searchChat(text, chats))
  };

  focusSearch = () => {
    this.refs.searchChats.focus()
  };

  handleChange = (e) => {
    this.setState({
      searchText: e.target.value.toLowerCase()
    });
    const searchText = e.target.value.toLowerCase();
    const displayedChat = this.props.chatsIds.filter((el) => {
      const searchValue = this.props.users[el].name.toLowerCase() + " " + this.props.users[el].surname.toLowerCase();
      return searchValue.indexOf(searchText) !== -1;
    });
    this.searchUser(searchText, displayedChat);
  };

  render() {
    const {location, chats, displayChatsIds, chatsIds, users, usersIds, friendsIds} = this.props;
    return (

      <div className="card chats-list">
        <div className="card-header">
          <div className="input-group">
            <input value={this.state.searchText} onChange={this.handleChange} ref="searchChats" type="search"
                   className="form-control no-borders" placeholder="Поиск в чатах"/>
          </div>
        </div>
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          renderTrackHorizontal={props => <div {...props} style={{display: 'none'}}/>}
        >
          { (!this.state.searchText.length && !displayChatsIds.length) &&
          <div className="absolute-center w-100 card-block text-gray-light font-sm">
            <p>На&nbsp;«Прессфиде» можно связаться c&nbsp;журналистом или&nbsp;экспертом напрямую.
              Начните прямо на&nbsp;этой странице&nbsp;— <a className="js-autofocus-on" href="javascript:void(0)"
                                                            onClick={this.focusSearch}>найдите пользователя по&nbsp;
                имени</a>
              и&nbsp;напишите ему сообщение.</p>
          </div>
          }

          <div className="list-group list-group-clean js-list-chats">
            { !!(this.state.searchText.length && displayChatsIds.length) &&
            <li className="list-group-item-head">Мои чаты</li>
            }
            {displayChatsIds.map(chatId => {
              return (
                <SearchListChat
                  chatId={chatId}
                  user={users[chatId]}
                  from_me={chatId == chats[chatId].user_id_to}
                  message={chats[chatId].message}
                  is_active={this.props.chat_id == chatId}
                  key={'chat' + chatId}
                />
              );
            })}
            { !!(this.state.searchText.length && friendsIds.length) &&
            <li className="list-group-item-head">Мои контакты</li>
            }
            {friendsIds.map(userId => {
              return (
                <SearchListUser
                  userId={userId}
                  user={users[userId]}
                  key={'user' + userId}
                  is_active={this.props.chat_id == userId}
                />
              )
            })}

            {!!(this.state.searchText.length && usersIds.length) &&
            <li className="list-group-item-head">Все пользователи</li>
            }
            {usersIds.map(userId => {
              return (
                <SearchListUser
                  userId={userId}
                  user={users[userId]}
                  key={'user' + userId}
                  is_active={this.props.chat_id == userId}
                />
              )
            })}
          </div>
        </Scrollbars>
      </div>
    );
  }
}
