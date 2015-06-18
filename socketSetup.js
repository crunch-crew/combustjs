var sockets = require('socket.io');
var db = require('./db');
var r = require('rethinkdb');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);
	io.on('connection', function(socket) {
		//if user request to subscribe to a table, put them in a room with that table name
		socket.on('subscribeTable', function(subscribeRequest) {
			socket.join(subscribeRequest.tableName);
			socket.emit("subscribeSuccess", "successfully subscribed to changes in table: " + subscribeRequest.tableName);
		});

		//{path: '/root/etc', data: json}
		socket.on('push', function(pushRequest) {
			console.log("pushRequest is:", pushRequest);
			db.connect(function(conn) {
				r.db('test').table('yolo').insert(pushRequest).run(conn);
			}, pushRequest);
		});

		//{path: '/root/etc', id:'name' data: json}
		socket.on('set', function(setRequest) {
			console.log("setRequest is:", setRequest);
			//preproessing here
			db.connect(function(conn) {
				console.log("setRequest.path: ", setRequest.path);
				console.log("setRequset.id: ", setRequest.id);
				r.db('test').table('yolo').filter({path: setRequest.path, id: setRequest.id}).update(setRequest).run(conn);
				r.db('test').table('yolo').filter(r.row('path').match(setRequest.path + setRequest.id + "/*")).delete().run(conn);
			}, setRequest);
		})
	});
	return io;
}

// exports.io = io;