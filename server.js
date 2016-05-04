'use strict';

// Functionality for making rooms
// 
// 1. rooms are stored in mogodb
// 2. rooms have an owner who can set the default playlist for a room
// 3. rooms have a visibility - public, private, invite only
// 4. rooms will kick up a new timeline instance
// 5. need socket events to be only for a certain room (namespaces or rooms?)

// Design for rooms index
// 
// 1. 

// Load config
require('dotenv').config();

// Get dependencies
const express = require('express'),
	nunjucks = require('nunjucks'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require('express-flash'),
	session = require("express-session"),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	multipart = require('connect-multiparty'),
	nodemailer = require('nodemailer');

// Get local configs and resources
const database = require('./app/database'),
	resources = require('./app/resources');

// Instantiate servers and stores
const app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	MongoStore = require('connect-mongo')(session),
	store = new MongoStore({
		mongooseConnection: mongoose.connection
	});

// Set middleware
app
	.use(express.static(__dirname + '/assets'))
	.use(session({
		store: store,
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
	.use(multipart())
	.use(require('./app/bootstrap'));

// Map resources
resources.app = app;
resources.nunjucks = nunjucks;
resources.passport = passport;
resources.io = io;
resources.sessionStore = store;
resources.dirname = __dirname;

// Load app components
require('./app/nunjucks')();
require('./app/passport')();
require('./app/routes')();
require('./app/api')();

// Connect to mongodb
mongoose.connect(database.url);

// Start listening
const server = http.listen(process.env.PORT, process.env.HOSTNAME, () => {
	console.log('http://%s:%s', server.address().address, server.address().port);
});