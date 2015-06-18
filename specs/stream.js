var io = require('socket.io-client')
var r = require('rethinkdb');
var db = require('../db');

var utils = {
	dbName: 'test',
	tableName: 'yolo'
}

console.log("db is:", db);

var serverAddress = 'http://0.0.0.0:3000';

var socket = io.connect(serverAddress);

describe('Sockets', function() {
	it('should successfully establish a socket connection', function(done) {
		socket.on('connect', function() {
			done();
		})
	});

	it('should successfully subscribe to a table', function(done) {
		socket.emit('subscribeTable', {tableName: utils.tableName});
		socket.once('subscribeSuccess', function(response) {
			done();
		});
	});
});

describe('Stream', function() {
	after(function(done) {
		db.connect(function(conn) {
			r.db(utils.dbName).table(utils.tableName).delete().run(conn, done);
		});
	})
	//delete inserted item
	// after(function(done) {

	// });

	//check if received object is same as submitted message - implement
	it('should receive updates when a table is changed', function(done) {
		// socket.emit('subscribeTable', {tableName: utils.dbName});
		socket.once('tableChange', function(change) {
			done();
		});
		db.connect(function(conn) {
			r.db(utils.dbName).table(utils.tableName).insert({msg: "so easysdsdf"}).run(conn);
		});
	});

	it('should push into the database', function(done) {
		socket.emit('push', {path:'/root/users/', name:"Richie", age:22});
		socket.once('tableChange', function(change) {
			done();
		});
	});

	//fix done part of test - test is not complete
	it('should set to paths in the database', function(done) {
		db.connect(function(conn) {
			r.db(utils.dbName).table(utils.tableName).insert({path:"/root/", id:"users"}).run(conn);
		});
		socket.once('tableChange', function(change) {
			done();
			console.log("received change: ", change);
		});
		socket.emit('set', {path:'/root/', id:'users', testProperty: true});
		// socket.once('tableChange', function(change) {
		// 	console.log("received the following update from the server:", change);
		// 	done();
		// });
	})
});