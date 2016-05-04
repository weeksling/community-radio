"use strict";

const Room = require('../models/room'),
	User = require('../models/user'),
	resources = require('../app/resources'),
	Timeline = require('../app/timeline'),
	Events = require('../app/events').constructor,
	sockets = require('../app/sockets');

const Lobby = {

	setupLobby: (id) => {
		resources.lobbys[id] = {};
		resources.lobbys[id].timeline = new Timeline();
		var emitter = resources.lobbys[id].events = new Events();
		emitter.on('socketConnect', (socket) => {
			emitter.emit('queueChange');
		});
		emitter.on('newSong', (id, dj) => {
			emitter.emit('queueChange');
		});
		emitter.on('joiningQueue', (user) => {
			emitter.emit('queueChange');
		});
		emitter.on('leavingQueue', (user) => {
			emitter.emit('queueChange');
		});
		resources.lobbys[id].socket = sockets.lobby(id);
		emitter.on('queueChange', () => {
			resources.lobbys[id].timeline.updateQueue.call(resources.lobbys[id].timeline, (djQueue, currentDj, users) => {
				djQueue = djQueue.map((id) => {
					return {
						username: users.filter((user) => user._id == id)[0].username,
						id: id
					}
				});
				resources.lobbys[id].socket.emit('queueChange', {djQueue, currentDj});
			});
		});
	},

	index: (req, res) => {
		if(!resources.lobbys) {
			resources.lobbys = {};
		}
		if(!resources.lobbys[req.params.roomId]) {
			Lobby.setupLobby(req.params.roomId);
		}
		res.render('lobby.html', {
			message: req.flash('message'),
			user: req.user,
			lobby: req.params.roomId
		});
	}

};

module.exports = Lobby;