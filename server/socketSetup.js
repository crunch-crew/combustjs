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

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);

	io.use(function(socket, next) {
		var token = socket.request._query.token;
		//decrypt the token
		jwt.verify(token, config.jwtSecret, function(err, decoded) {
			//if token decrypts successfully, user is authenticated, otherwise reject connection
			//temporarily disabled while client authentication methods are built
			console.log("token received: ", token);
			// if (!err) {
				console.log("password decoded!");
				socket.userToken = decoded;
				next();
			// }
		});
	});

	io.on('connection', function(socket) {
		//notify client of successful connection
		socket.emit('connectSuccess', "Socket connection established");

		//setup all the individual socket listeners
		subscribeUrl.setup(socket);
		getUrl.setup(socket);
		getUrlChildren.setup(socket);
		push.setup(socket, io);	
		set.setup(socket);
		update.setup(socket, io);
	});

	return io;
};
