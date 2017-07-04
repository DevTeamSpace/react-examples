import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import Avatar from './Avatar';

export default class Comment extends React.Component {

  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
  };

  prepareAvatarData(item) {
    return {
      className: 'media-object',
      src: item.avatar,
      item,
      popover: true,
    };
  }

  render() {

    const item = this.props.item;

    return (
      <div className="media mb-2">
        <div className="media-left">
          <Link >
            <Avatar params={this.prepareAvatarData(item)} dispatch={this.props.dispatch} />
          </Link>
        </div>
        <div className="media-body">
          <div className="bubble bubble-white">
            {item.text}
          </div>
          <div className="text-gray font-xs ml-half">
            <small>{item.created_at}</small>
          </div>
        </div>
      </div>
    );
  }
}
