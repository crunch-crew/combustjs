var sockets = require('socket.io');
var db = require('./db');
var r = require('rethinkdb');
var parseToRows = require('./parseToRows');
var parseToObj = require('./parseToObj');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);
	io.on('connection', function(socket) {
		//notify client of successful connection
		socket.emit('connectSuccess', "Socket connection established");

		socket.on('subscribeUrlChildAdd', function(childAddRequest) {
			socket.join(childAddRequest.url + "-" + "childadd");
			socket.emit("subscribeUrlChildAddSuccess", "Successfully subscribed to child add events");
		})
		//if user request to get to a table, put them in a room with that table name
		socket.on('getUrl', function(getRequest) {
			// socket.join(getRequest.url);
			var urlArray = getRequest.url.split('/');
			urlArray = urlArray.slice(1,urlArray.length-1);
			console.log("urlArray is: ", urlArray);
			if (urlArray.length === 1) {
				rootString = '/';
			}
			else {
				rootString = "/" + (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
			}
			console.log("root string is: ", rootString);
			var rootRow;
			var childrenRows;
			db.connect(function(conn) {
				r.db('test').table('yolo').filter({path: rootString}).run(conn, function(err, cursor) {
					if (err) throw err;
					cursor.toArray(function(err, result) {
						console.log("first query results look like: ", result);
						rootRow = result[0];
						console.log("root row: ", result);
					});
					r.db('test').table('yolo').filter(r.row('path').match(getRequest.url+"*")).run(conn, function(err, cursor) {
						if (err) throw err;
						cursor.toArray(function(err, result) {
							childrenRows = result;
							console.log("children rows: ", result);
							// console.log("reconstructed object is:", parseToObj(rootRow, childrenRows));
						});
					})
				});
			});
			socket.emit("getSuccess", "successfully getd to changes in url: " + getRequest.url);
		});

		//{path: '/root/etc', data: json}
		socket.on('push', function(pushRequest) {
			var rows = parseToRows(pushRequest);
			var rootRow = rows.length-1;
			db.connect(function(conn) {
				r.db('test').table('yolo').insert({}).run(conn, function(err, result) {
					var generatedKey = result.generated_keys[0];
					// socket.emit("pushSuccess", {pushedId: generatedKey});
					var rows = parseToRows(pushRequest.data, pushRequest.path, generatedKey);
					var rootRow = rows.slice(rows.length-1)[0];
					var childRows = rows.slice(0,rows.length-1);
					r.db('test').table('yolo').get(generatedKey).update(rootRow).run(conn);
					r.table('yolo').insert(childRows).run(conn, function(err, results) {
						socket.emit('pushSuccess', "Successfully pushed into database!");
						//emit to clients listening for child add events at this url
						io.to(pushRequest.path + "-" + "childadd").emit(pushRequest.path + "-" + "childaddSuccess", pushRequest.data);
						console.log("emitted to room: ", pushRequest.path + "-" + "childadd");
					});
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