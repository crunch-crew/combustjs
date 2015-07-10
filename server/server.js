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
var apiRouteHandlers = require('./api/apiRouteHandlers');

app.use(parser.json());

//cors
var cors = require('cors');
app.use(cors());

var socketSetup = require('./socketSetup');

//authentication 
var signup = require('./authentication/signup');
var authenticate = require('./authentication/authenticate');
app.post('/signup', signup);
app.post('/authenticate', authenticate);

//api
app.get('/api*', apiRouteHandlers.getRoute); 

//if deployed to heroku will use heroku port, otherwise on local machine will use port 3000
var port = process.env.port || 3000;
var server = app.listen(port);
//layers socket.io ontop of the express server
var io = socketSetup.setup(server);
db.connect(dbListeners.setup, io);
console.log("Express server listening on %d in %s mode", port, app.settings.env);

exports.app = app;
exports.io =  io;
