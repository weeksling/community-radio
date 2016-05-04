import React from 'react';

class MyRooms extends React.Component {

	constructor(props) {
		super(props);
		this.getRooms();
		this.state = {
			rooms: []
		};
	}

	getRooms() {
		$.ajax({
			url: '/rooms',
			method: 'GET',
			success: (rooms) => {
				this.setState({rooms});
			},
			error: (err) => {
				console.log(err);
			}
		});
	}

	deleteRoom(id) {
		$.ajax({
			url: '/rooms/'+id,
			method: 'DELETE',
			success: (rooms) => {
				this.getRooms();
			},
			error: (err) => {
				console.log(err);
			}
		});
	}

	render() {
		return (
			<div>
				<h2>Your Lobby's</h2>
				<ul>
					{this.state.rooms.map((room, i) => {
						return <li key={'rooms-'+i}><a href={"/lobby/"+room._id}>{room.name}</a> - <a href="#" onClick={this.deleteRoom.bind(this, room._id)}>Delete Room</a></li>
					})}
				</ul>
			</div>
		);
	}
}

MyRooms.defaultProps = {};

export default MyRooms;