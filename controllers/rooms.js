"use strict";

const Room = require('../models/room'),
	User = require('../models/user');

module.exports = {

	get: (req, res) => {
		User.findOne({_id: req.session.passport.user._id})
			.populate('rooms')
			.exec((err, user) => {
				if(err || !user) {
					res.status(400);
					res.send(err);
				} else {
					res.send(user.rooms);
				}
			});
	},

	delete: (req, res) => {
		Room.findOne({_id: req.params.id}, (err, room) => {
			if(room.owner = req.session.passport.user._id) {
				room.remove((err) => {
					if (!err) {
						res.send(true);
					} else {
						res.status(400);
						res.send(err);
					}
				});
			} else {
				res.status(403);
				res.send('you do not own this room');
			}
		});
	},

	list: (req, res) => {
		// To Do: add pagination
		Room.find({}, (err, rooms) => {
			if(err) {
				res.status(400) ;
				res.send(err);
			} else {
				res.send(rooms);
			}
		});
	},

	create: (req, res) => {
		var room = new Room();
		room.name = req.body.name;
		room.description = req.body.description;
		room.genre = req.body.genre;
		room.capacity = req.body.capacity;
		room.owner = req.session.passport.user._id;
		room.save((err, room) => {
			if(err) {
				res.status(400);
				res.send(err);
			} else {
				User.findOne({_id: req.session.passport.user._id}, (err, user) => {
					if(err) {
						res.status(400);
						res.send(err);
					} else {
						user.rooms.push(room._id);
						user.save((err) => {
							if(err) {
								res.status(400);
							} else {
								res.send(room);
							}
						});
					}
				});
			}
		});
	}

};