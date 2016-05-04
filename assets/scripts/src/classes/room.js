import React from 'react';
import Audience from './audience';

class Room extends React.Component {

	constructor(props) {

		super(props);

		this.state = {
			audience: [],
			song: null,
			dj: null
		};

		this.socket = io(window.location.href.split("/")[0]+'//'+window.location.href.split("/")[2]+'/radio');
		
		this._bindEvents();
		this._getListeners();

	}

	_bindEvents() {
		this.socket.on('listening', this._getListeners.bind(this));
		this.socket.on('notListening', this._getListeners.bind(this));
		this.socket.on('songDetails', this._setOverlayDetails.bind(this));
		this.socket.on('newSong', this._setOverlayDetails.bind(this));
	}

	_getListeners() {
		$.get('/radio/listening/'+window._bootstrapData.lobbyId, (response) => {
			this.setState({audience: response});
		});
	}

	_setOverlayDetails(songInfo) {
		this.setState({
			dj: songInfo.dj ? songInfo.dj.username : null,
			avatar: songInfo.dj && songInfo.dj.avatar ? songInfo.dj.avatar : '/images/avatars/default.jpg'
		});
		$.get('/media/details/'+songInfo.id, (response) => {
			if(response.items[0]) {
				this.setState({song: response.items[0]});
			}
		});
	}

	render() {

		return (

			<div className="room-wrapper">
				<input type="checkbox" className="toggle-overlay" />
				<section id="overlay">

					<img src={this.state.avatar} height="80" />
					<h3>Current Dj: {this.state.dj ? this.state.dj : 'Community.dj Bot'}</h3>

					{(() => {
						if(this.state.song) {
							return <h3>{this.state.song.snippet.title}</h3>
						}
					})()}
					
					<p>Audience</p>

					<Audience listening={this.state.audience}/>

				</section>
			</div>

		);
	}

}

export default Room;