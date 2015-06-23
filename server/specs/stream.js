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
		//at the end of tests, wipe the entire table and then re-insert the root node
		db.connect(function(conn) {
			r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, results) {
				r.db('test').table('test').insert({path: null, _id: '/'}).run(conn, done);
			});
		});
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
			var obj = parseToObj(utils.testRows.testRoot, utils.testRows.testChildren);
			obj.should.eql(utils.testObj);
			done();
		});
	});

	describe('Stream', function() {
		it('should push into the database', function(done) {
			socket.emit('push', {path:'/messages/', data: utils.dummyObj});
			socket.once("/messages/-pushSuccess", function(data) {
				done();
			});
		});

		it('should successfully get a url', function(done) {
			socket.emit('push', {path:'/', data: utils.dummyObj});
			socket.once("/-pushSuccess", function(data) {
				var path = '/' + data.key + '/';
				socket.emit('getUrl', {url: path});
				socket.once(path + '-getSuccess', function(data) {
						data.should.eql(utils.testObj);
						done();
				});
			});
		});

		//check if received object is same as submitted message - implement
		it('should receive updates when a child is added to a url', function(done) {
			socket.once('/messages/-childaddSuccess', function(data) {
				data.should.eql(utils.testObj);
				done();
			});
			socket.emit('subscribeUrlChildAdd', {url: '/messages/'});
			socket.on('/messages/-subscribeUrlChildAddSuccess', function(response) {
				socket.emit('push', {path:'/messages/', data: utils.dummyObj});
			});
		});

		it('should set to paths in the database', function(done) {
			socket.once('/users/-value', function() {
				socket.once('/users/-getSuccess', function(data) {
					data.should.eql({testProperty: true, testSomething:{testProp: 'hello'}});
					done();
				});
				socket.emit('getUrl', {url: '/users/'});
			});
			socket.emit('set', {path:'/users/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
		});

		it('should emit to listeners to parents of the path has changed', function(done) {
			socket.once('/-value', function(data) {
				done();
			})
			socket.emit('set', {path:'/users/', data: {testProperty: true, testSomething:{testProp: 'hallo'}}})
		});

		it('should delete children of the path that is being set and set path to passed data', function(done) {
			socket.once('/users/-value', function() {
				socket.once('/users/-getSuccess', function(data) {
					data.should.eql({testProperty: false});
					done();
				});
				socket.emit('getUrl', {url: '/users/'});
			});
			socket.emit('set', {path:'/users/', data: {testProperty: false}});
		});

	});
});