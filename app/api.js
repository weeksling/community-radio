'use strict';

const resources = require('./resources'),
	app = resources.app;

const controllers = {
		user: require('../controllers/user'),
		radio: require('../controllers/radio'),
		playlists: require('../controllers/playlists'),
		youtube: require('../controllers/youtube'),
		rooms: require('../controllers/rooms')
	};

const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}

module.exports = () => {

	// Restful API
	app

		// Auth layer api
		.post('/register', controllers.user.register)
		.post('/login', controllers.user.login)
		.post('/forgot-password', controllers.user.recover)
		.post('/settings', isAuthenticated, controllers.user.update)
		.get('/logout', isAuthenticated, controllers.user.logout)
		.delete('/removeAvatar', isAuthenticated, controllers.user.removeAvatar)

		// Radio api
		.get('/radio/listening/:lobbyId', controllers.radio.listening)
		.post('/radio/join/:lobbyId', controllers.radio.joinQueue)
		.get('/radio/leave/:lobbyId', controllers.radio.leaveQueue)
		.get('/radio/song/:lobbyId', controllers.radio.getSong)

		// Rooms
		.post('/rooms', controllers.rooms.create)
		.get('/rooms', controllers.rooms.get)
		.get('/rooms/list', controllers.rooms.list)
		// Create
		// Edit
		// Delete

		// Playlist api
		.get('/playlists/:guid', controllers.playlists.list)
		.post('/playlists', controllers.playlists.create)
		.post('/playlists/:id', controllers.playlists.update)
		.delete('/playlists/:id', controllers.playlists.delete)

		// Media
		.get('/media/details/:id', controllers.youtube.details)
		.get('/media/search/:keyword', controllers.youtube.search)

		.get('/nextSong/:lobbyId', controllers.radio.forceNext);


	return app;

};