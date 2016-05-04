import React from 'react';
import ReactDOM from 'react-dom';
import Youtube from '../utils/youtube';
import Cookies from '../utils/cookies';

class Player extends React.Component {

	constructor(props) {

		super(props);
		
		this.socket = io(window.location.href.split("/")[0]+'//'+window.location.href.split("/")[2]+'/lobby/'+window._bootstrapData.lobbyId);

		this.state = {
			loaded: true
		};

		this.socket.on('newSong', (info) => {
			this.changeVideo(info.id);
		});

		this.socket.on('songDetails', (data) => {
			if(!this.made) this.makePlayer(data.id, data.elapsed);
		});

		// Polling fallback
		setTimeout(() => {
			if(!this.made) {
				$.get('/radio/song/'+window._bootstrapData.lobbyId, (data) => {
					console.log(data);
					if(!this.made) this.makePlayer(data.id, data.elapsed);
				});
			}
		}, 3000);

	}

	changeVideo(videoId) {
		if(!this.made) {
			this.makePlayer(videoId, 0);
		} else {
			this.player.loadVideoById(videoId);
		}
	}

	makePlayer(id, elapsed) {

		this.made = true;
		Youtube.onReady(() => {
			this.player = new YT.Player(ReactDOM.findDOMNode(this), {
				videoId: id,
				events: {
					onReady: (event) => {
						event.target.seekTo(elapsed || 0);
						event.target.playVideo();
						this.setState({loaded: true});
						if(Cookies.cookies.volume) this.player.setVolume(Cookies.cookies.volume);
					}
				},
				playerVars: { 
					controls: 0,
					rel: 0,
					showinfo: 0
				}
			});
		});

		setTimeout(() => {
			if(this.player.getPlayerState() !== 1) {
				console.log('state is not playing');
				$.get('/radio/song/'+window._bootstrapData.lobbyId, (data) => {
					console.log(data); // elapsed is wrong
					this.player.loadVideoById(data.id);
					this.player.playVideo();
					console.log(this.player);
					this.player.seekTo(data.elapsed);
				});
			}
		}, 2500);
		
	}

	render(){
		return (
			<div id="player" style={{display: this.state.loaded ? 'block' : 'none'}}></div>
		);
	}

}

Player.defaultProps = {};

export default Player;