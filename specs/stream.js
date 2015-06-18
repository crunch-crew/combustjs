var io = require('socket.io-client')
var r = require('rethinkdb');
var db = require('../db');

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
		socket.emit('subscribeTable', {tableName: "yolo"});
		socket.on('subscribeSuccess', function(response) {
			console.log(response);
			done();
		});
	});
});

describe('Stream', function() {
	//delete inserted item
	// after(function(done) {

	// });

	it('should receive updates when a table is changed', function(done) {
		// socket.emit('subscribeTable', {tableName: "test"});
		socket.on('tableChange', function(change) {
			console.log(change);
			done();
		});
		db.connect(function(conn) {
			r.db("test").table("yolo").insert({msg: "so easysdsdf"}).run(conn);
		})
	})
})