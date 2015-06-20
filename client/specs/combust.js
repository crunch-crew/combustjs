var io = require('socket.io-client')
var expect = require('chai').expect;
var should = require('should');
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
			// array: [{test:"hello"}, {test:'world'}],
			name: "viable"
		}
	}
}

describe("Combust tests", function() {
	var socket;
	before(function(done) {
		socket = io.connect(serverAddress);
		done();
	})

	beforeEach(function(done) {
		combustRef = utils.newCombust(socket);
		done();
	})

	after(function(done) {
		socket.disconnect();
		done();
	})

	describe('Non-networking', function() {
		var combustRef;
		beforeEach(function(done) {
			combustRef = utils.newCombust(socket);
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
				combustRef = utils.newCombust(socket);
				done();
			});

			it('should change the referenced path when called', function(done) {
				combustRef.child('users');
				combustRef.pathArray.should.eql(['/','users']);
				done();
			});

			it('should be chainable', function(done) {
				combustRef = utils.newCombust(socket);
				combustRef.child('library').child('history').child('japan');
				combustRef.pathArray.should.eql(['/', 'library', 'history', 'japan']);
				done();
			});
		});

		describe('constructPath()', function() {
			beforeEach(function(done) {
				combustRef = utils.newCombust(socket);
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

		describe('push()', function() {
			beforeEach(function(done) {
				combustRef = utils.newCombust(socket);
				done();
			});

			it('should push an object into the database at the current path', function(done) {
				var test = combustRef.push(utils.testObj, function() {
					console.log("in callback, path is: ", test.pathArray);
					done();
				});
				console.log("outside callback, path is ", test.pathArray);
			});

			// it('should return a combust reference to the new url', function() {

			// })
		})


	})
});