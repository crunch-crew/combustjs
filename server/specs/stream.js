var io = require('socket.io-client');
var r = require('rethinkdb');
var db = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var expect = require('chai').expect;
var should = require('should');
var supertest = require('supertest');
var configTest = require('./configTest');

/* Anytime you parseToRows, you need to use a dummy testObj!!!! */
var utils = configTest.utils;

var serverAddress = configTest.serverAddress;

describe("server tests", function() {
	before(function(done) {
		// socket = io.connect(serverAddress);
		done();
	});

	after(function(done) {
		// socket.disconnect();
		//at the end of tests, wipe the entire table and then re-insert the root node
		db.connect(function(conn) {
			r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, results) {
				r.db('test').table('test').insert({path: null, _id: '/'}).run(conn, function(err ,results) {
					r.db('test').table('test').insert({path: '/', _id: 'users'}).run(conn, done);
				});
			});
		});
	});

	describe("authentication", function() {
		var agent;
		before(function(done) {
			agent = utils.createAgent(serverAddress);
			done();
		});

		it('should create a new user on signup', function(done) {
			agent
				.post('/signup')
				.send(utils.testUser)
				.expect(201)
				.expect(function(res) {
					//checks if inserting the user was successful
					res.body.success.should.equal(true);
				})
				.end(function(err, response) {
					if (err) throw err;
					else {
						//makes sure a user cant be duplicated
						agent
							.post('/signup')
							.send(utils.testUser)
							.expect(401)
							.end(function(err, response) {
								if (err) throw err;
								else {
									done();
								}
							});
					}
				});
		});

		it('should authenticate valid credentials and return a json web token', function(done) {
			agent.post('/authenticate')
			.send(utils.testUser)
			.expect(200)
			.expect(function(res) {
				res.body.success.should.equal(true);
				res.body.token.should.exist;
			})
			.end(function(err, response) {
				if (err) throw err;
				else {
					done();
				}
			});
		});

		it('should not authenticate invalid credentials', function(done) {
			agent.post('/authenticate')
			.send({
				username: "testUser",
				password: "badPassword",
			})
			.expect(400)
			.expect(function(res) {
				res.body.success.should.equal(false);
			})
			.end(function(err, response) {
				if (err) throw err;
				else {
					done();
				}
			});
		});
	})

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
		var socket;
		var agent;
		//json web token return from server will be stored here
		var token;

		after(function(done) {
			socket.disconnect();
			done();
		});

		//create a user and obtain a webtoken
		before(function(done) {
			agent = utils.createAgent(serverAddress);
			agent.post('/signup').send(utils.authUser).expect(201).end(function(err, response) {
				if (err) throw err;
				else {
					agent.post('/authenticate').send(utils.authUser).expect(200).end(function(err, response) {
					//store the web token
						token = response.body.token;
						if (err) throw err;
						else {
							//authenticate the client with the webtoken - used for remaining tests
							socket = io.connect(serverAddress, {
								//send the web token with the initial websocket handshake
								query: 'token=' + token
							});
							done();
						}
					});
				}
			});
		});

		//TODO: implement this test
		describe('authentication', function() {
			it("should authenticate websocket connections with a valid token", function(done) {
				done();
			});
		});

		// describe('api', function() {
			//should be updated to check if pushed item is actually in db
			describe('push', function() {
				it('should push into the database', function(done) {
					socket.emit('push', {path:'/messages/', data: utils.dummyObj});
					socket.once('/messages/-pushSuccess', function(data) {
						done();
					});
				});
			});

			describe('get', function() {
				it('should successfully get an url', function(done) {
					socket.emit('push', {path:'/', data: utils.testObj});
					socket.once('/-pushSuccess', function(data) {
						var path = '/' + data.key + '/';
						socket.emit('getUrl', {url: path});
						socket.once(path + '-getSuccess', function(data) {
								data.data.should.eql(utils.testObj);
								done();
						});
					});
				});
			});

			//check if received object is same as submitted message - implement
			describe('set', function() {
				it('should set to paths in the database', function(done) {
					socket.once('/messages/-setSuccess', function() {
						socket.once('/messages/-getSuccess', function(data) {
							data.data.should.eql({testProperty: true, testSomething:{testProp: 'hello'}});
							done();
						});
						socket.emit('getUrl', {url: '/messages/'});
					});
					socket.emit('set', {path:'/messages/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
				});

				it('should delete children of the path that is being set and set path to passed data', function(done) {
					socket.once('/messages/-setSuccess', function() {
						socket.once('/messages/-getSuccess', function(data) {
							data.data.should.eql({testProperty: false});
							done();
						});
						socket.emit('getUrl', {url: '/messages/'});
					});
					socket.emit('set', {path:'/messages/', data: {testProperty: false}});
			});
		});
	
			describe('getUrlChildren', function() {
				it('should return an array with getUrlChildren', function(done) {
					socket.once('/-getUrlChildrenSuccess', function(data) {
						if(Array.isArray(data)) {
							done();
						}
					});
					socket.emit('getUrlChildren', {url: '/'});
				});
				// will implement.
				// it('should get the children of the url', function(done) {

				// });
			});

		describe('listeners', function() {

			it('should notify listeners of parent urls of value changes', function(done) {
				socket.once('/-value', function(data) {
					if(data) {
						done();
					}
				});
				socket.emit('set', {path:'/users/', data: {testProperty: true, testSomething:{testProp: 'hallo'}}})
			});	

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
		});
	});
});