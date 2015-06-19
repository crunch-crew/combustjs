var sockets = require('socket.io');
var db = require('./db');
var r = require('rethinkdb');
var parseToRows = require('./parseToRows');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);
	io.on('connection', function(socket) {
		//notify client of successful connection
		socket.emit('connectSuccess', "Socket connection established");
		//if user request to subscribe to a table, put them in a room with that table name
		socket.on('subscribeUrl', function(subscribeRequest) {
			socket.join(subscribeRequest.url);
			socket.emit("subscribeSuccess", "successfully subscribed to changes in url: " + subscribeRequest.url);
		});

		//{path: '/root/etc', data: json}
		socket.on('push', function(pushRequest) {
			var rows = parseToRows(pushRequest);
			var rootRow = rows.length-1;
			db.connect(function(conn) {
				r.db('test').table('yolo').insert({placeholder:"placeHolder text"}).run(conn, function(err, result) {
					var generatedKey = result.generated_keys[0];
					socket.emit("pushSuccess", {pushedId: generatedKey});
					var rows = parseToRows(pushRequest.data, pushRequest.path, generatedKey);
					var rootRow = rows.slice(rows.length-1)[0];
					var childRows = rows.slice(0,rows.length-1);
					r.db('test').table('yolo').get(generatedKey).update(rootRow).run(conn);
					r.table('yolo').insert(childRows).run(conn);
				});
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