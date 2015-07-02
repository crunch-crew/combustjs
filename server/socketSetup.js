var sockets = require('socket.io');
var db = require('./db');
var r = require('rethinkdb');
var parseToRows = require('./utils/parseToRows');
var parseToObj = require('./utils/parseToObj');
var config = require('./config');
var jwt = require('jsonwebtoken');

//socket listener setup functions
var subscribeUrl = require('./socketHandlers/subscribeUrl');
var getUrl = require('./socketHandlers/getUrl');
var getUrlChildren = require('./socketHandlers/getUrlChildren');
var push = require('./socketHandlers/push');
var set = require('./socketHandlers/set');
var update = require('./socketHandlers/update');
var evaljs = require('./socketHandlers/evaljs');
var deleteUrl = require('./socketHandlers/delete');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	var highestUrl;
	//this is what actually attaches socket.io to the express server
	io = sockets(server);

	io.use(function(socket, next) {
		var token = socket.request._query.token;
		//decrypt the token
		jwt.verify(token, config.jwtSecret, function(err, decoded) {
			//if token isn't passed, set property to null
			if (err && err.message === 'jwt must be provided') {
				socket.userToken = null;
				next();
			}
			//notify client token is expired
			else if (err && err.name === 'TokenExpiredError') {
				next(new Error('TokenExpiredError'));
			}
			//if token exists but error in decryption, trigger failure on connect
			else if (err) {
				next(new Error('TokenCorruptError'));
			}
			//decoded successfuly, store decoded token and pass connection on to handlers
			else {
				socket.userToken = decoded;
				next();
			}
		});
	});

	io.on('connection', function(socket) {
		//notify client of successful connection
		socket.emit('connectSuccess', {success: true});

		//setup all the individual socket listeners
		subscribeUrl.setup(socket);
		getUrl.setup(socket);
		getUrlChildren.setup(socket);
		push.setup(socket, io);	
		set.setup(socket);
		update.setup(socket, io);
		evaljs.setup(socket);	
		deleteUrl.setup(socket, io);	
	});

	return io;
};
