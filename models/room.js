const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	roomsSchema = new Schema({
		name: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		genre: {
			type: String,
			default: 'Assorted'
		},
		defaultPlaylist: {
			type: ObjectId,
			ref: 'Playlist'
		},
		capacity: {
			type: String,
			default: 10
		},
		owner: {
			type: ObjectId,
			ref: 'User'
		},
		audience: {
			type: String,
			default: 0
		}
	});

module.exports = mongoose.model('Rooms', roomsSchema);