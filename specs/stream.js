var io = require('socket.io-client')
var r = require('rethinkdb');
var db = require('../db');
var parseToRows = require('../parseToRows');
var parseToObj = require('../parseToObj');
var expect = require('chai').expect;
var should = require('should');

var utils = {
	dbName: 'test',
	tableName: 'yolo',
	testObj: {
				users: {
					user1: {
						name: "richie"
					},
					user2: {
						name: "kuldeep"
					},
					user: {
						name: "jack"
					}
				},
				activated: true,
				messedUp: false,
				test: {
					array: [{test:"hello"}, {test:'world'}],
					name: "viable"
				}
			},
	testRows: {
		testRoot: { path: '/root/', id: 'testObj', activated: true, messedUp: false },
		testChildren: [ 
				{ path: '/root/testObj/users/', id: 'user1', name: 'richie' },
			  { path: '/root/testObj/users/', id: 'user2', name: 'kuldeep' },
			  { path: '/root/testObj/users/', id: 'user', name: 'jack' },
			  { path: '/root/testObj/', id: 'users' },
			  { path: '/root/testObj/test/array/', id: '0', test: 'hello' },
			  { path: '/root/testObj/test/array/', id: '1', test: 'world' },
			  { path: '/root/testObj/test/', id: 'array' },
			  { path: '/root/testObj/', id: 'test', name: 'viable' }]
	}
}

console.log("db is:", db);

var serverAddress = 'http://0.0.0.0:3000';


describe("server tests", function() {
	var socket;
	before(function(done) {
		socket = io.connect(serverAddress);
		done();
	})

	after(function(done) {
		socket.disconnect(done);
		done();
	})

	describe("parseToRows", function() {
		it('should parse nested objects into rows', function(done) {
			var rows = parseToRows(utils.testObj,"/root/", 'testObj');
			rows.should.eql([ 
				{ path: '/root/testObj/users/', id: 'user1', name: 'richie' },
			  { path: '/root/testObj/users/', id: 'user2', name: 'kuldeep' },
			  { path: '/root/testObj/users/', id: 'user', name: 'jack' },
			  { path: '/root/testObj/', id: 'users' },
			  { path: '/root/testObj/test/array/', id: '0', test: 'hello' },
			  { path: '/root/testObj/test/array/', id: '1', test: 'world' },
			  { path: '/root/testObj/test/', id: 'array' },
			  { path: '/root/testObj/', id: 'test', name: 'viable' },
			  { path: '/root/', id: 'testObj', activated: true, messedUp: false } ]);
			done();
		})
	})

	xdescribe("parseToObj", function() {
		it('should parse database rows into objects', function(done) {
			var obj = parseToObj(utils.testRows.testRoot, utils.testRows.testChildren);
			obj.should.eql(utils.testObj);
			done();
		})
	})

	//passes sometimes
	describe('Sockets', function() {
		it('should successfully establish a socket connection', function(done) {
			socket.on('connectSuccess', function() {
				done();
			})
		});

		it('should successfully subscribe to a url', function(done) {
			socket.emit('subscribeUrl', {url: '/'});
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
		xit('should receive updates when a table is changed', function(done) {
			// socket.emit('subscribeTable', {tableName: utils.dbName});
			socket.once('tableChange', function(change) {
				done();
			});
			db.connect(function(conn) {
				r.db(utils.dbName).table(utils.tableName).insert({msg: "so easysdsdf"}).run(conn);
			});
		});

		it('should push into the database', function(done) {
			socket.emit('push', {path:'/root/users/', data: utils.testObj});
			socket.once("pushSuccess", function(data) {
				done();
			})
		});

		//fix done part of test - test is not complete
		xit('should set to paths in the database', function(done) {
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
		});
	});
});