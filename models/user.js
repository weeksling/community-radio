const mongoose = require('mongoose'),
	io = require('../app/resources').io,
	User = require('./user'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	playlist = require('./playlist'),
	userSchema = new Schema({
		username: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		avatar: {
			type: String
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		resetPasswordToken: {
			type: String
		},
		resetPasswordExpires: {
			type: Date
		},
		playlists: [{
			type: ObjectId,
			ref: 'Playlist'
		}],
		rooms: [{
			type: ObjectId,
			ref: 'Rooms'
		}],
		activePlaylist: {
			type: ObjectId,
			ref: 'Playlist'
		},
		inQueue: {
			type: Boolean,
			expires: '8h',
			default: false
		},
		isConnected: {
			type: Boolean,
			expires: '10h',
		},
		lastSong: {
			type: String
		},
		_socketId: {
			type: String
		}
	});

module.exports = mongoose.model('User', userSchema);