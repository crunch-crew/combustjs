var io = require('socket.io-client');
var expect = require('chai').expect;
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/db');
var Combust = require('../Combust');

var serverAddress = 'http://0.0.0.0:3000';

var utils = {
	dbName: 'test',
	tableName: 'test',
	newCombust: function(socket) {
		return new Combust({
			dbName: this.dbName,
			tableName: this.tableName,
			socket: socket,
			io: io,
			serverAddress: serverAddress
		});
	},
	newAuthCombust: function() {
		return new Combust({
			dbName: this.dbName,
			tableName: this.tableName,
			io: io,
			serverAddress: serverAddress
		});
	},
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
			name: "viable"
		}
	},
	testUser: {
		username: "testUser",
		password: "testPassword",
		email: "testEmail"
	},
	authUser: {
		username: "authUser",
		password: "authPassword",
		email: "authEmail"
	},
	testUpdateObj: {
		users: {
			user1: {
				name: "richie Updated"
			},
			user2: {
				name: "kuldeep Updated"
			},
			user3: {
				name: "jack"
			},
			user4: {
				name: "new insert"
			}
		},
		activated: false,
		messedUp: false,
		test: {
			name: "viable not"
		}
	}
}

describe("Combust tests", function() {
	before(function(done) {
		socket = io.connect(serverAddress, {'forceNew': false});
		done();
	})

	beforeEach(function(done) {
		combustRef = utils.newCombust();
		done();
	})

	after(function(done) {
		db.connect(function(conn) {
			r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, cursor) {
				if (err) throw err;
				// console.log(cursor);
				r.db('test').table('test').insert({path: null, _id: '/', msg:"this is the root node of the db"}).run(conn, done);
			});
		});
	})

	describe('Non-networking', function() {
		var combustRef;
		beforeEach(function(done) {
			combustRef = utils.newCombust();
			done();
		});

		it('should initialize properly based on the passed parameters', function(done) {
			combustRef.dbName.should.equal('test');
			combustRef.tableName.should.equal('test');
			combustRef.pathArray.should.eql(['/']);
			done();
		});

		describe('child()', function() {
			beforeEach(function(done) {
				combustRef = utils.newCombust();
				done();
			});

			it('should change the referenced path when called', function(done) {
				combustRef.child('users');
				combustRef.pathArray.should.eql(['/','users']);
				done();
			});

			it('should be chainable', function(done) {
				combustRef = utils.newCombust();
				combustRef.child('library').child('history').child('japan');
				combustRef.pathArray.should.eql(['/', 'library', 'history', 'japan']);
				done();
			});
		});

		describe('constructPath()', function() {
			beforeEach(function(done) {
				combustRef = utils.newCombust();
				done();
			});

			it('should construct a proper path', function(done) {
				combustRef.constructPath().should.equal('/');
				combustRef.child('library');
				combustRef.constructPath().should.equal('/library/');
				combustRef.child('history');
				combustRef.constructPath().should.equal('/library/history/');
				combustRef.child('japan');
				combustRef.constructPath().should.equal('/library/history/japan/');
				done();
			})
		});
	});
	describe('networking', function() {		
		var socket;
		var authRef;
		var combustRef;
		before(function(done) {
			//create a user to use for tests that require authentication
			authRef = utils.newAuthCombust();
			authRef.newUser(utils.authUser, function(response) {
				if (response.success) {
					authRef.authenticate(utils.authUser, function(response) {
						socket = io.connect(serverAddress, {
							//send the web token with the initial websocket handshake
							query: 'token=' + response.token
						});
						authRef.socket = socket;
						done();
					});
				}
			});
			// done();
		});
		beforeEach(function(done) {
			combustRef = utils.newCombust(socket);
			done();
		});
		after(function(done) {
			// socket.disconnect();
			done();
		});

		describe('newUser', function() {
			it('should create a new user', function(done) {
				combustRef.newUser(utils.testUser, function(response) {
					response.success.should.equal(true);
					response.status.should.equal(201);
					done();
				});
			});
			it('should not duplicate new users', function(done) {
				combustRef.newUser(utils.testUser, function(response) {
					response.success.should.equal(false);
					response.status.should.equal(401);
					done();
				});
			});
		});

		describe('authenticate', function() {
			it('should receive and store a web token when presenting valid credentials', function(done) {
				//uses already created user
				combustRef.authenticate(utils.testUser, function(response) {
					response.success.should.equal(true);
					response.status.should.equal(200);
					response.token.should.exist;
					combustRef.token.should.exist;
					done();
				});
			});
		});

		describe('push()', function() {
			it('should push an object into the database at the current path', function(done) {
				var test = authRef.push(utils.testObj, function(response) {
					done();
				});
			});

			it('should return a new combust object that references the new url', function(done) {
				var test = authRef.push(utils.testObj, function(response) {
					response.created.should.equal(true);
					test.pathArray.should.eql(['/', response.key]);
					test.should.not.equal(authRef);
					done();
				});
			});
		});

		describe('delete()', function() {
			it('should emit a socket event to the server', function() {
				var test = authRef.delete(utils.testObj, function(done) {
					done();
				});
			});
		});

		describe('set()', function() {
			it('should set an object into database at the current path', function(done) {
				var test = authRef.set(utils.testObj, function() {
					done();
				});
			});
		});

		describe('update()', function() {
			beforeEach(function(done) {
				combustRef = utils.newCombust(socket);
				done();
			});

			after(function(done) {
				db.connect(function(conn) {
					r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, cursor) {
						if (err) throw err;
						r.db(utils.dbName).table(utils.tableName).insert({path: null, _id: '/', msg:"this is the root node of the db"}).run(conn, done);
					});
				});
			})

			it('should update values for existing keys in the object in database at the current path', function(done) {
				var test = combustRef.update(utils.testUpdateObj, function(response) {
					done();
				});
			});

			xit('should insert new keys and values in database at the current path', function(done) {
				var test = combustRef.update(utils.testObj, function(response) {
					done();
				});
			});
		});

		describe('.on()', function() {
			before(function(done) {
				db.connect(function(conn) {
					r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, cursor) {
						if (err) throw err;
						r.db(utils.dbName).table(utils.tableName).insert({path: null, _id: '/', msg:"this is the root node of the db"}).run(conn, done);
					});
				});
			})

			it('should receive updates when children are added', function(done) {
				var timesCalled = 0;
				setTimeout(function() {
					authRef.push({msg: "hi"});
				},50);
				authRef.on('child_added', function(data) {
					timesCalled++;
					if(timesCalled === 1) {
						data.msg.should.equal("this is the root node of the db");
					}
					if(timesCalled === 2) {
						data.msg.should.equal("hi");
						done();
					}
				});
			});
		});
	});
});