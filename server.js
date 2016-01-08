'use strict';

// Get dependencies
const express = require('express'),
	nunjucks = require('nunjucks'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require('express-flash'),
	session = require("express-session"),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser');

// Get local configs and resources
const database = require('./app/database'),
	resources = require('./app/resources');

// Instantiate servers and stores
const app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	MongoStore = require('connect-mongo')(session);

// Set middleware
app
	.use(express.static(__dirname + '/assets'))
	.use(session({
		store: new MongoStore({
			mongooseConnection: mongoose.connection
		}),
		secret: "itsAMassiveSecret",
		resave: false,
		saveUninitialized: true
	}))
	.use(cookieParser())
	.use(bodyParser.urlencoded({ extended: false }))
	.use(bodyParser.json())
	.use(passport.initialize())
	.use(passport.session())
	.use(flash())
	.use(require('./app/bootstrap'));

// Map resources
resources.app = app;
resources.nunjucks = nunjucks;
resources.passport = passport;
resources.io = io;

// Load app components
require('./app/nunjucks')();
require('./app/passport')();
require('./app/sockets')();
require('./app/routes')();
require('./app/api')();

// Connect to mongodb
mongoose.connect(database.url);

// Start listening
const server = http.listen(process.env.PORT || 3000, process.env.HOSTNAME || 'localhost', () => {
	console.log('http://%s:%s', server.address().address, server.address().port);
});