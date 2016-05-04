const EventEmitter = require('events').EventEmitter;

module.exports = {
	emitter: new EventEmitter(),
	constructor: EventEmitter
};