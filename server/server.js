var express = require('express');
var app = express();
var db = require('./db');
var dbListeners = require('./dbListeners');
var sockets = require('socket.io');
var jwt = require('jsonwebtoken');
var parser = require('body-parser');
var config = require('./config');
var r = require('rethinkdb');
var bcrypt = require('bcrypt');
app.use(parser.json());

var socketSetup = require('./socketSetup');

//authentication 
var signup = require('./authentication/signup');
var authenticate = require('./authentication/authenticate');
app.post('/signup', signup);
app.post('/authenticate', authenticate);

//if deployed to heroku will use heroku port, otherwise on local machine will use port 3000
var port = process.env.port || 3000;
var server = app.listen(port);
//layers socket.io ontop of the express server
var io = socketSetup.setup(server);
db.connect(dbListeners.setup, io);
console.log("Express server listening on %d in %s mode", port, app.settings.env);


exports.app = app;
exports.io =  io;


// var cors = require('cors');
//contains a setup function that adds web sockets to the server

// app.use(parser.urlencoded({extended: true}));

// app.use(session({
// 	secret: 'chillestWhales',
// 	resave: false,
// 	saveUninitialized: false
// }));

// app.use(cors());