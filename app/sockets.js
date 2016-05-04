const cookie = require('cookie'),
	cookieParser = require('cookie-parser'),
	Session = require('../models/session'),
	User = require('../models/user'),
	resources = require('./resources'),
	radio = require('../controllers/radio'),
	Timeline = require('../app/timeline'),
	Emitter = require('../app/events').emitter,
	io = resources.io;

resources.socketChannels = {};

module.exports = {

	lobby: (id) => {
		if(resources.socketChannels[id]) return;
		var channel = io.of('/lobby/'+id),
			timeline = resources.lobbys[id].timeline,
			events = resources.lobbys[id].events;
		channel.on('connection', (socket) => {
			
			var onNewSong = (id, dj) => {
				socket.emit('newSong', {id,dj});
				events.emit('newSong', id, dj);
			};

			// Audience events
			channel.emit('listening');
			Emitter.emit('socketConnect', socket, timeline, id);
			events.emit('socketConnect', socket, timeline, id);
			socket.on('disconnect', () => {
				channel.emit('notListening');
				Emitter.emit('socketDisconnect', socket, timeline);
				events.emit('socketDisconnect', socket, timeline);
				timeline.off('newSong', onNewSong);
			});

			// Radio events - passes current song and duration to client on connection
			if(timeline.currentDj && timeline.playing) {
				User.findOne({_id: timeline.currentDj}, (err, user) => {
					socket.emit('songDetails', {
						id: timeline.playing,
						elapsed: timeline.elapsed,
						dj: user
					});
				});
			} else if(timeline.playing) {
				socket.emit('songDetails', {
					id: timeline.playing,
					elapsed: timeline.elapsed,
					dj: timeline.currentDj
				});
			}
			
			timeline.on('newSong', onNewSong);

		});

		// Map session to socket client and store client id in session store
		channel.use((socket, next) => {
			var handshake = socket.request;
			if(handshake.headers.cookie) {
				var cookieData = cookie.parse(handshake.headers.cookie),
				sessionId = cookieParser.signedCookie(cookieData['connect.sid'], 'itsAMassiveSecret');
				Session.findOne({_id: sessionId}, (err, session) => {
					if(!session) return;
					var sessionData = JSON.parse(session.session);
					if(!sessionData || !sessionData.passport || !sessionData.passport.user) return;
					session._socketId = socket.id;
					session.save((err) => {
						User.findOne({_id: sessionData.passport.user._id}, (err, user) => { // Save to user model so we can access it there for mongoose middleware
							user._socketId = session._socketId;
							user.save((err) => {
								next();
							});
						});
					});
				});
			} else {
				next();
			}
		});

		return channel;

	}

}