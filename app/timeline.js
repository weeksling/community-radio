"use strict";

const request = require('request'),
	User = require('../models/user'),
	winston = require('winston'),
	io = require('./resources').io;

winston.add(winston.transports.File, { filename: 'timeline.log' , timestamp: true });
winston.remove(winston.transports.Console);

class Timeline {

	constructor(opts) {
		
		if(!opts) opts = {};
		this.opts = Object.assign({}, opts, {
			refreshInterval: 1000,
			youtubeApiKey: 'AIzaSyABtT6HgNEXwI2tJwN7C43QXfyV9Km7fkU'
		});

		this.defaultPlaylist = [
			'49Gz0Jfp-jI',
			"lpy-TVzE4vg",
			"0ok0glLJsr4",
			"52Gg9CqhbP8",
			"TWPAn6nFPuc",
			"WX6BPuaIDkA",
			"6kBA1g8dJ_c",
			"CQlX2nJK12Q",
			"8HS7_fOrg7g",
			"YymBqhvld20",
			"WM8bTdBs-cw",
			"46l236O7Iv8"
		];

		this.inRoom = 0;
		this.callbacks = {};
		this.djQueue = [];
		this.currentDj = null;

	}

	on(event, callback) {
		if(this.callbacks[event]) {
			this.callbacks[event].push(callback);
		} else {
			this.callbacks[event] = [callback];
		}
	}

	off(event, callback) {
		if(this.callbacks[event] && this.callbacks[event].indexOf(callback) > -1){
			this.callbacks[event].splice(this.callbacks[event].indexOf(callback), 1);
		}
	}

	playSong(id) {

		this.playing = false;
		this.startsAt = new Date();
		winston.log('info', 'Getting song details for '+id);
		this._getSongLength(id, (data) => {
			
			this.endsAt = new Date();
			this.elapsed = 0;

			var now = new Date();
			winston.log('info', 'Song length is '+data.second+'seconds and '+data.minutes+' minutes');
			this.endsAt = new Date(now.getTime() + (data.seconds*1000));
			this.endsAt = new Date(this.endsAt.getTime() + (data.minutes*60000));
			
			this.playing = id;

			winston.log('info', 'Now playing, starts at '+this.startsAt+' and ends at '+this.endsAt);

			winston.log('info', 'Got song details for '+id+' and setting up interval');
			if(this.tracker) clearInterval(this.tracker);
			this.tracker = setInterval(this._nextTick.bind(this), this.opts.refreshInterval);
			
			if(this.callbacks.newSong) {
				User.findOne({_id: this.currentDj}, (err, user) => {
					for(var callback of this.callbacks.newSong){
						winston.log('info', 'Firing socket.io newSong callback');
						callback(id, user);
					}
				});
			}

		});

	}

	noUsers() {
		winston.log('info', 'Running noUsers()');
		if(this.running) this.stopProcess();
	}

	hasUsers() {
		winston.log('info', 'Running hasUsers()');
		if(!this.running) this.startProcess();
	}

	stopProcess() {
		if(!this.running) return;
		winston.log('info', 'Stopping process');
		this.running = false;
		this.elapsed = 0;
		this.playing = false;
		clearInterval(this.tracker);
	}

	startProcess() {
		if(this.running) return;
		winston.log('info', 'Starting process');
		this.running = true;
		this.playSong(this.defaultPlaylist[0]);
		this.tracker = setInterval(this._nextTick.bind(this), this.opts.refreshInterval);
	}

	updateQueue(callback) {
		User.find({}, (err, users) => {

			var nextInQueue = 0;
			if(this.currentDj && this.djQueue.length > 1) {
				nextInQueue = this.djQueue.indexOf(this.currentDj) + 1;
			}
			
			for(var user of users) {
				var id = user._id.toString();
				if(user.inQueue && user.inLobby == this.opts._id && this.djQueue.indexOf(id) == -1) {
					this.djQueue.push(id);
				} else if((!user.inQueue || user.inLobby != this.opts._id) && this.djQueue.indexOf(id) > -1) {
					this.djQueue.splice(this.djQueue.indexOf(id), 1);
				} else if(!user.inQueue || user.inLobby != this.opts._id) {
					
				}
			}

			if(nextInQueue == this.currentDj) {
				nextInQueue = this.djQueue.indexOf(this.currentDj)++;
			}

			this.nextInQueue = nextInQueue;

			callback.apply(null, [this.djQueue, this.currentDj, users]);

		});
	}

	_nextTick() {
		if(!this.playing) return;
		var now = new Date();
		if(now.getTime() > this.endsAt.getTime()) {
			this.elapsed = 0;
			winston.log('info', 'Inside tick and song has ended so _getNextSong()');
			this._getNextSong();
		} else {
			this.elapsed = Math.abs((this.startsAt.getTime() - now.getTime()) / 1000);
		}
	}

	_getVideoData(id, callback) {
		var url = 'https://www.googleapis.com/youtube/v3/videos?id='+id+'&part=contentDetails,status&key='+this.opts.youtubeApiKey,
			self = this;

		winston.log('info', 'Getting song data '+id);
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				winston.log('info', 'Got song data '+id);
				var data = JSON.parse(body);
				if(!data.items[0] || !data.items[0].status || !data.items[0].status.embeddable) {
					self._getNextSong();
				} else {
					callback(data);
				}
			}
		});
	}

	_getSongLength(id, callback) {
		this._getVideoData(id, function(data) {
			winston.log('info', 'Duration is '+data.items[0].contentDetails.duration);
			var duration = data.items[0].contentDetails.duration.replace('PT', ''),
				minutes, seconds;
			if(duration.split('M')[1]) {
				minutes = duration.split('M')[0],
				seconds = duration.split('M')[1].replace('S', '');
			} else {
				minutes = 0,
				seconds = duration.split('S')[0];
			}
			callback({
				minutes: minutes,
				seconds: seconds
			});
		});
	}

	_getNextSong() {

		this.updateQueue(() => {
			if(this.djQueue[0]) {
				this.currentDj = this.djQueue[this.nextInQueue] || this.djQueue[0];
				this._loadFromUsersPlaylist();
			} else {
				this.currentDj = null;
				this._loadFromDefaultPlaylist();
			}
		});

	}

	_loadFromDefaultPlaylist() {
		winston.log('info', 'Loading song from default playlist');
		var index = this.defaultPlaylist.indexOf(this.playing),
			nextSong = this.defaultPlaylist[1 + index];
		this.playSong(nextSong);
	}

	_loadFromUsersPlaylist() {
		winston.log('info', 'Loading song from user0s playlist');
		User.findOne({_id: this.currentDj})
			.populate('activePlaylist')
			.exec((err, user) => {
				var songs = user.activePlaylist.songs;
				if(!user.lastSong) {
					user.lastSong = songs[0];
					user.save();
				} else {
					user.lastSong = songs[1 + songs.indexOf(user.lastSong)] || songs[0];
					user.save();
				}
				winston.log('info', 'Loading song from users playlist with last song as '+user.lastSong);
				this.playSong(user.lastSong);
			});
	}

}

module.exports = Timeline;