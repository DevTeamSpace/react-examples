import React, { Component, PropTypes } from 'react';
import AvatarSrc from '../../static/img/avatar_default.png';
import { Link } from 'react-router';
import PersonDropdown from './PersonDropdown';
import { sendMessage } from '../containers/Chat/actions';
import { Scrollbars } from 'react-custom-scrollbars';

export default class ChatCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      message: ''
    }
  };

  static propTypes = {
    auth: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  static defaulProps = {

  }

  sendMessage = () => {
    if (this.state.message.trim()) {
      this.props.dispatch(sendMessage(this.state.message, this.props.user.user_id));
      this.setState({
        message: ''
      });
    }
  };

  componentDidUpdate() {
    const { scrollbars } = this.refs;
    const scrollHeight = scrollbars.getScrollHeight();
    scrollbars.scrollTop(scrollHeight);
  }

  messageChange = (e) => {
    if (e.target.value.length <= 10000) this.setState({ message: e.target.value });
  };

  render() {
    const { location, messages, user, friends, groups, dispatch, usersGroups, auth } = this.props;
    return (

      <div className="card chat">
        <div className="card-header">
          <div className="row">
            <div className="col-xs-1 hidden-lg-up">
              <a className="js-back-to-chats py-1 font-weight-sbold" href="#">
                <i className="material-icons font-lg">arrow_back</i></a>
            </div>
            <div className="col-xs-10 col-lg-9 text-truncate text-xs-center text-md-left">
              <Link className="font-weight-bold text-gray js-header-name"
                to={`/people/${user.user_id}`}>{user.name} {user.surname}</Link>
              <span className="hidden-md-down">{user.smi ? user.smi.map(smi => { return ', ' + smi.name }) : ''} {user.company ? user.company.map(company => { return ', ' + company.name }) : ''}</span>
            </div>
            <div className="col-xs-1 col-lg-3">
              <PersonDropdown
                isFriend={!!(friends && !!friends[user.user_id])}
                groups={groups}
                item={user}
                dispatch={dispatch}
                usersGroups={usersGroups}
                auth={auth}
                friends={friends}
                showAlways={true}
              />
            </div>
          </div>
        </div>


        <div className="card-block js-chat-comments" id="chat-scroll">
          <Scrollbars
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
            renderTrackHorizontal={props => <div {...props} style={{ display: 'none' }} />}
            ref="scrollbars"
          >
            { !messages.length &&
            <div className="absolute-center">
              <i className="material-icons material-icons-xl text-gray-lighter">chat_bubble_outline</i>
            </div>
            }
            {messages.map(message => {
              return (
                <div className={`media mb-2 mr-1 ${message.unconfirm ? 'msg-sent' : ''}`} key={message.created_at}>
                  {message.user_id_from == user.user_id &&
                    <div className="media-left">
                      <img className="media-object rounded-circle"
                        width="35"
                        height="35"
                        src={user.avatar || AvatarSrc} />
                    </div>
                  }
                  <div className="media-body">
                    <div className={`bubble ${message.user_id_to == user.user_id ? 'bubble-white' : ''}`}>
                      {message.message}
                    </div>
                    <div className="text-gray-light font-xs">
                      { !message.error &&
                      <small className="show-hvr d-block">{message.created_at}</small>
                      }
                      { message.error &&
                      <small className="text-danger d-block">Ошибка. Сообщение не отправлено</small>
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </Scrollbars>
        </div>

        <div className="card-footer">
          <form>
            <div className="btn-in-textarea">
              <span className="message-counter">{10000 - this.state.message.length}</span>
              <textarea value={this.state.message} onChange={this.messageChange} ref="message" className="form-control no-borders" rows="5" placeholder="Текст сообщения" />
              <button type="button" className="btn btn-link" onClick={this.sendMessage}>
                <i className="material-icons">send</i>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

