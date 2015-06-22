var sockets = require('socket.io');
var db = require('./db');
var r = require('rethinkdb');
var parseToRows = require('./utils/parseToRows');
var parseToObj = require('./utils/parseToObj');
var config = require('./config');

//socket listener setup functions
var subscribeUrl = require('./socketHandlers/subscribeUrl');
var getUrl = require('./socketHandlers/getUrl');
var getUrlChildren = require('./socketHandlers/getUrlChildren');
var push = require('./socketHandlers/push');
var set = require('./socketHandlers/set');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);
	io.on('connection', function(socket) {
		//notify client of successful connection
		socket.emit('connectSuccess', "Socket connection established");

		//setup all the individual socket listeners
		subscribeUrl.setup(socket);
		getUrl.setup(socket);
		getUrlChildren.setup(socket);
		push.setup(socket, io);	
		set.setup(socket);	
	});

	return io;
};
