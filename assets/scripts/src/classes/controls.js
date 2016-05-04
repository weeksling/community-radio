import React from 'react';
import Parser from 'react-dom-parser';
import Volume from './volume';
import dom from '../utils/dom';

class Controls extends React.Component {

	constructor(props) {

		super(props);

		this.state = {
			overlayOpen: true,
			inDjQueue: window._bootstrapData.inDjQueue
		};

		this.socket = io(window.location.href.split("/")[0]+'//'+window.location.href.split("/")[2]+'/radio');
		
		Parser.onParseComplete(() => {
			this.player = Parser.getByNode(document.getElementById('player'));
		});

	}

	voteUp(e) {

	}

	voteDown(e) {

	}

	toggleOverlay(e) {
		dom.$body.toggleClass('overlay-open');
		this.setState({overlayOpen: !this.state.overlayOpen});
	}

	toggleDJ(e) {
		if(this.state.inDjQueue){
			$.get('/radio/leave/'+window._bootstrapData.lobbyId, (response) => {
				this.setState({inDjQueue: false});
				this.socket.emit('leavingQueue');
			});
		} else {
			$.ajax({
				method: 'POST',
				url: '/radio/join/'+window._bootstrapData.lobbyId,
				success: (response) => {
					this.socket.emit('joiningQueue');
					this.setState({inDjQueue: true});
				}
			})
		}
	}

	
				// <button type="button" onClick={this.voteDown.bind(this)}><i className="fa fa-thumbs-o-down"></i></button>
				// <button type="button" onClick={this.voteUp.bind(this)}><i className="fa fa-thumbs-o-up"></i></button>
	render() {
		return (
			<div className="controls-wrapper">
				<button type="button" onClick={this.toggleDJ.bind(this)}>{this.state.inDjQueue ? "Leave Dj Queue" : "Join Dj Queue"}</button>
				<button type="button" onClick={this.toggleOverlay.bind(this)}><i className={this.state.overlayOpen ? "fa fa-expand" : "fa fa-compress"}></i></button>
				<Volume />
			</div>
		);
	}

}

Controls.defaultProps = {};

export default Controls;