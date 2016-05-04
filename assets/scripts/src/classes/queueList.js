import React from 'react';

class QueueList extends React.Component {

	constructor(props) {

		super(props);

		this.state = {
			users: [],
			current: null
		}

		this.socket = io(window.location.href.split("/")[0]+'//'+window.location.href.split("/")[2]+'/lobby/'+window._bootstrapData.lobbyId);
		
		this._bindEvents();

	}

	_bindEvents() {
		this.socket.on('queueChange', this._changeQueue.bind(this));
	}

	_changeQueue(data) {
		this.setState({
			users: data.djQueue,
			current: data.currentDj
		});
	}

	render(){
		return (
			<ul className="queue-list">
				<li className="title">Dj Queue</li>
				{this.state.users.map((user, key) => {
					return <li key={key} className={user.id == this.state.current ? 'current' : ''}>{user.username}</li>
				})}
			</ul>
		);
	}

}

QueueList.defaultProps = {};

export default QueueList;