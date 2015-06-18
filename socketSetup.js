var sockets = require('socket.io');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);
	console.log("sockets added to server");
	io.on('connection', function(socket) {
		socket.on('subscribeTable', function(subscribeRequest) {
			socket.join(subscribeRequest.tableName);
			io.to(subscribeRequest.tableName).emit("subscribeSuccess", "successfully subscribed to changes in table: " + subscribeRequest.tableName);
			console.log("after subscribing, room is:", io.nsps['/'].adapter.rooms);
		});
	});

	console.log("in socket setup, server is: ", server);
	return io;
}

console.log("outside of setup, io is:", io);

// exports.io = io;