var r = require('./db');
var config = require('./config.js');
var handleError = require('./rethinkQuery/handleError');

var setup = function(db, io) {
	//checks if a root node exists, and if it doesnt, creates it.
	r.db(config.dbName).table(config.tableName).filter({path: null, _id: '/'}).run()
	.then(function(result) {
		//if length is 0, root node doesn't exist
		if (result.length === 0) {
			//insert root node
			r.db(config.dbName).table(config.tableName).insert({path: null, _id: '/'}).run().then(function(result) {
			});
		}			
	}).error(handleError);
	//checks if a users node exists, and if it doesnt, creates it
	r.db(config.dbName).table(config.tableName).filter({path: '/', _id: 'users'}).run().then(function(result) {
		//if length is 0, root node doesn't exist
		if (result.length === 0) {
			//insert root node
			r.db(config.dbName).table(config.tableName).insert({path: '/', _id: 'users'}).run().then(function(result) {
			});
		}			
	}).error(handleError);
};

exports.setup = setup;
