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
			socket: socket
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
	}
}

describe("Combust tests", function() {
	before(function(done) {
		done();
	})

	beforeEach(function(done) {
		combustRef = utils.newCombust();
		done();
	})

	after(function(done) {
		db.connect(function(conn) {
			r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, cursor) {
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
		before(function(done) {
			socket = io.connect(serverAddress, {'forceNew': true});
			done();
		});
		beforeEach(function(done) {
			combustRef = utils.newCombust(socket);
			done();
		});
		after(function(done) {
			socket.disconnect();
			done();
		});

		describe('newUser', function() {
			it('should create a new user', function(done) {
				combustRef.newUser({
					username: "testUser",
					password: "testPassword",
					email: "testEmail"
				});
			})
		})

		describe('push()', function() {
			it('should push an object into the database at the current path', function(done) {
				var test = combustRef.push(utils.testObj, function() {
					done();
				});
			});

			it('should return a new combust object that references the new url', function(done) {
				var test = combustRef.push(utils.testObj, function(response) {
					response.created.should.equal(true);
					test.pathArray.should.eql(['/', response.key]);
					test.should.not.equal(combustRef);
					done();
				});
			});
		});

		describe('set()', function() {
			it('should set an object into database at the current path', function(done) {
				var test = combustRef.set(utils.testObj, function() {
					done();
				});
			});
			
		});

		describe('.on()', function() {
			it('should receive updates when children are added', function(done) {
				var alreadyRan = false;
				//this is a jenky test, but it works for now
				setTimeout(function() {
					combustRef.push({msg: "hi"});
				},50);
				combustRef.on('child_add', function(data) {
					data.msg.should.equal("hi");
					done();
				});
			});
		});


	})
});