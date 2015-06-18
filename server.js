var express = require('express');
var app = express();
var db = require('./db');
var dbListeners = require('./dbListeners');
var sockets = require('socket.io');

// var parser = require('body-parser');
// var cors = require('cors');
//contains a setup function that adds web sockets to the server
var socketSetup = require('./socketSetup')

// app.use(parser.json());
// app.use(parser.urlencoded({extended: true}));

// app.use(session({
// 	secret: 'chillestWhales',
// 	resave: false,
// 	saveUninitialized: false
// }));

// app.use(cors());

// var start = function() {
	//if deployed to heroku will use heroku port, otherwise on local machine will use port 3000
	var port = process.env.port || 3000;
	var server = app.listen(port);
	//layers socket.io ontop of the express server
	var io = socketSetup.setup(server);
	db.connect(dbListeners.setup, io);
	console.log("in start, io is:", io);
	console.log("Express server listening on %d in %s mode", port, app.settings.env)
// }

// exports.start = start;
exports.app = app;
exports.io =  io;