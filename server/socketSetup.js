var sockets = require('socket.io');
var db = require('./db');
var r = require('rethinkdb');
var parseToRows = require('./utils/parseToRows');
var parseToObj = require('./utils/parseToObj');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);
	io.on('connection', function(socket) {
		//notify client of successful connection
		socket.emit('connectSuccess', "Socket connection established");
		console.log("user connected");

		socket.on('subscribeUrlChildAdd', function(childAddRequest) {
			console.log("subscribed to room: ", childAddRequest.url + "-" + "childadd");
			socket.join(childAddRequest.url + "-" + "childadd");
			socket.emit("subscribeUrlChildAddSuccess", "Successfully subscribed to child add events");
		});
		// if user request to get to a table, put them in a room with that table _id
		socket.on('getUrl', function(getRequest) {
			// socket.join(getRequest.url);
			var urlArray;
			if (getRequest.url === '/') {
				rootString = null;
				_idFind = "/";
			}
			else {
				urlArray = getRequest.url.split('/');
				urlArray = urlArray.slice(1,urlArray.length-1);
				rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
				_idFind = urlArray[urlArray.length-1];
			}
			// console.log("urlArray is: ", urlArray);
			// if (urlArray.length === 1) {
			// }
			// else {
			// }
			// console.log("root string is: ", rootString);
			var rootRow;
			var childrenRows;

			db.connect(function(conn) {
				r.db('test').table('test').filter({path: rootString, _id:_idFind}).run(conn, function(err, cursor) {
					if (err) throw err;
					cursor.toArray(function(err, result) {
						// console.log("first query results look like: ", result);
						console.log("rootRow is:", result[0]);
						console.log("rootstring was: ", rootString);
						console.log("_idFind was:", _idFind);
						rootRow = result[0];
					});
					r.db('test').table('test').filter(r.row('path').match(getRequest.url+"*")).run(conn, function(err, cursor) {
						if (err) throw err;
						cursor.toArray(function(err, result) {
							childrenRows = result;
							socket.emit("getSuccess", parseToObj(rootRow, childrenRows));
						});
					});
				});
			});
		});

		//{path: '/root/etc', data: json}
		// create a copy of original request if you are RETURNING the original data, parseToRows WILL mutate the original data.
		socket.on('push', function(pushRequest) {
			var original = JSON.parse(JSON.stringify(pushRequest));
			var path = pushRequest.path;
			var rows = parseToRows(pushRequest);
			var rootRow = rows.length-1;

			db.connect(function(conn) {
				r.db('test').table('test').insert({}).run(conn, function(err, result) {
					var generatedKey = result.generated_keys[0];
					// socket.emit("pushSuccess", {pushedId: generatedKey});
					var rows = parseToRows(pushRequest.data, pushRequest.path, generatedKey);
					var rootRow = rows.slice(rows.length-1)[0];
					var childRows = rows.slice(0,rows.length-1);
					r.db('test').table('test').get(generatedKey).update(rootRow).run(conn);
					r.table('test').insert(childRows).run(conn, function(err, results) {
						// console.log("children add results:", results);
						socket.emit('pushSuccess', {created: true, key: generatedKey});
						//emit to clients listening for child add events at this url
						io.to(original.path + "-" + "childadd").emit(original.path + "-" + "childaddSuccess", original.data);
						// io.to(pushRequest.path + "-" + "childadd").emit(pushRequest.path + "-childaddSuccess", pushRequest.data);
						console.log("emitted toL ",path + "-" + "childadd");
						console.log("emittede event: ", pushRequest.path + "-childaddSuccess");
						console.log("forwarded child to subscribers: ", pushRequest.data);
						// console.log("emitted to room: ", pushRequest.path + "-" + "childadd");
					});
				});
			}, pushRequest);
		});

		//{path: '/root/etc', id:'_id' data: json}
		socket.on('set', function(setRequest) {
			// console.log("setRequest is:", setRequest);
			//preproessing here
			db.connect(function(conn) {
				// console.log("setRequest.path: ", setRequest.path);
				// console.log("setRequset.id: ", setRequest._id);
				r.db('test').table('test').filter({path: setRequest.path, _id: setRequest._id}).update(setRequest).run(conn);
				r.db('test').table('test').filter(r.row('path').match(setRequest.path + setRequest._id + "/*")).delete().run(conn);
			}, setRequest);
		})
	});
	return io;
}

// exports.io = io;