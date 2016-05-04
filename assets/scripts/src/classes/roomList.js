import React from 'react';

class RoomList extends React.Component {

	constructor(props) {
		super(props);
		this.getRooms();
		this.state = {
			rooms: [],
			filter: false
		};
	}

	getRooms() {
		$.ajax({
			url: '/rooms/list',
			method: 'GET',
			success: (rooms) => {
				this.setState({rooms});
			},
			error: (err) => {
				console.log(err);
			}
		});
	}

	filter(value) {
		this.setState({filter: value.toLowerCase()});
	}

	render() {
		return (
			<table id="room-list">
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
						<th>Genre</th>
						<th>Capacity</th>
						<th>Listening</th>
					</tr>
				</thead>
				<tbody>
					{this.state.rooms.sort(function(a, b) { return b.name.indexOf('Community.dj') > -1 }).map((room, i) => {
						if(!this.state.filter || room.name.toLowerCase().indexOf(this.state.filter) > -1) {
							return (
								<tr key={"room-list-"+i}>
									<td><a href={"/lobby/"+room._id}>{room.name}</a></td>
									<td>{room.description}</td>
									<td>{room.genre}</td>
									<td>{room.Capacity}</td>
									<td>{room.audience}</td>
								</tr>
							);
						}
					})}
				</tbody>
			</table>
		);
	}

}

RoomList.defaultProps = {};

export default RoomList;