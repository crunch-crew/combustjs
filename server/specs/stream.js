var io = require('socket.io-client');
var r = require('rethinkdb');
var db = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var expect = require('chai').expect;
var should = require('should');

/* Anytime you parseToRows, you need to use a dummy testObj!!!! */
var utils = {
	dbName: 'test',
	tableName: 'test',
	testObj: {
				users: {
					user1: {
						name: "richie"
					},
					user2: {
						name: "kuldeep"
					},
					user: {
						name: "jack",
						something: ['hi', {something: 'hi'}]
					}
				},
				activated: true,
				messedUp: false,
				test: {
					// array: [{test:"hello"}, {test:'world'}],
					name: "viable"
				}
			},
	dummyObj: {
				users: {
					user1: {
						name: "richie"
					},
					user2: {
						name: "kuldeep"
					},
					user: {
						name: "jack",
						something: ['hi', {something: 'hi'}]
					}
				},
				activated: true,
				messedUp: false,
				test: {
					// array: [{test:"hello"}, {test:'world'}],
					name: "viable"
				}
			},
	testRows: {
		testRoot: { path: '/root/', _id: 'testObj', activated: true, messedUp: false },
		testChildren: [ 
				{ path: '/root/testObj/users/', _id: 'user1', name: 'richie' },
  			{ path: '/root/testObj/users/', _id: 'user2', name: 'kuldeep' },
  			{ path: '/root/testObj/users/user/something/', _id: '1', something: 'hi', _partArray: true },
  			{ '0': 'hi', path: '/root/testObj/users/user/', _id: 'something', _isArray: true, _length: 2 },
  			{ path: '/root/testObj/users/', _id: 'user', name: 'jack' },
  			{ path: '/root/testObj/', _id: 'users' },
  			{ path: '/root/testObj/', _id: 'test', name: 'viable' }
  			]
	}
};

var serverAddress = 'http://127.0.0.1:3000';


describe("server tests", function() {
	var socket;
	before(function(done) {
		socket = io.connect(serverAddress);
		done();
	});

	after(function(done) {
		socket.disconnect();
		done();
	});

	describe("parseToRows", function() {
		testObjDummy = {
			users: {
				user1: {
					name: "richie"
				},
				user2: {
					name: "kuldeep"
				},
				user: {
					name: "jack",
					something: ['hi', {something: 'hi'}]
				}
			},
			activated: true,
			messedUp: false,
			test: {
				// array: [{test:"hello"}, {test:'world'}],
				name: "viable"
			}
		};

		it('should parse nested objects into rows', function(done) {
			var rows = parseToRows(testObjDummy,"/root/", 'testObj');
			rows.should.eql([ 
				{ path: '/root/testObj/users/', _id: 'user1', name: 'richie' },
  			{ path: '/root/testObj/users/', _id: 'user2', name: 'kuldeep' },
  			{ path: '/root/testObj/users/user/something/', _id: '1', something: 'hi', _partArray: true },
  			{ '0': 'hi', path: '/root/testObj/users/user/', _id: 'something', _isArray: true, _length: 2 },
  			{ path: '/root/testObj/users/', _id: 'user', name: 'jack' },
  			{ path: '/root/testObj/', _id: 'users' },
  			{ path: '/root/testObj/', _id: 'test', name: 'viable' },
  			{ path: '/root/', _id: 'testObj', activated: true, messedUp: false } ]);
			done();
		});
	});

	describe("parseToObj", function() {
		it('should parse database rows into objects', function(done) {
			// console.log(utils.testRows.testRoot, utils.testRows.testChildren);
			var obj = parseToObj(utils.testRows.testRoot, utils.testRows.testChildren);
			// console.log(obj);
			// console.log(utils.testObj);
			obj.should.eql(utils.testObj);
			done();
		});
	});
	//passes sometimes
	describe('Sockets', function() {
		var socket;
		before(function(done) {
			socket = io.connect(serverAddress);
			done();
		});
		after(function(done) {
			db.connect(function(conn) {
				r.db(utils.dbName).table(utils.tableName).delete().run(conn, done);
			});
		});

		//fails sometimes
		it('should successfully establish a socket connection', function(done) {
			socket.on('connectSuccess', function() {
				done();
			})
			socket = io.connect(serverAddress, {'forceNew': true});
		});
	});

	describe('Stream', function() {

		// after(function(done) {
		// 	db.connect(function(conn) {
		// 		r.db(utils.dbName).table(utils.tableName).delete().run(conn, done);
		// 	});
		// });
		after(function(done) {
			db.connect(function(conn) {
				r.db(utils.dbName).table(utils.tableName).delete().run(conn, done);
			});
		})
		//delete inserted item
		// after(function(done) {

		// });

		console.log(socket);
		it('should push into the database', function(done) {

			socket.emit('push', {path:'/messages/', data: utils.dummyObj});
			socket.once("pushSuccess", function(data) {
				done();
			});
		});

		it('should successfully get a url', function(done) {
			socket.once('getSuccess', function(data) {
					data.should.eql(utils.testObj);
					done();
			});
			socket.emit('push', {path:'/', data: utils.dummyObj});
			socket.once("pushSuccess", function(data) {
				socket.emit('getUrl', {url: '/' + data.key + '/'});
			});
		});
		//check if received object is same as submitted message - implement
		it('should receive updates when a child is added to a url', function(done) {
			// socket.emit('getUrl', {url: '/root/messages/'});
			socket.once('/messages/-childaddSuccess', function(data) {
				// console.log("received new child from server: ", data);
				console.log(data.users.user.something);
				data.should.eql(utils.testObj);
				done();
			});
			// console.log("requesting add child listener on /messages/");
			socket.emit('subscribeUrlChildAdd', {url: '/messages/'});
			socket.on('subscribeUrlChildAddSuccess', function(response) {
				// console.log("successfully subscribed to child add events on /messages/");
				// console.log("add a child to /messages/");
				socket.emit('push', {path:'/messages/', data: utils.dummyObj});
				// console.log("pushing this child to /messages/", message);
			})
			// db.connect(function(conn) {
			// 	r.db(utils.dbName).table(utils.tableName).insert().run(conn);
			// });
			// socket.once('tableChange', function(change) {
			// 	done();
			// });
		});


		//fix done part of test - test is not complete
		xit('should set to paths in the database', function(done) {
			db.connect(function(conn) {
				r.db(utils.dbName).table(utils.tableName).insert({path:"/root/", _id:"users"}).run(conn);
			});
			socket.once('tableChange', function(change) {
				done();
				// console.log("received change: ", change);
			});
			socket.emit('set', {path:'/root/', _id:'users', testProperty: true});
			// socket.once('tableChange', function(change) {
			// 	console.log("received the following update from the server:", change);
			// 	done();
			// });
		});
	});
});