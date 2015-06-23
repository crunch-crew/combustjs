var r = require('rethinkdb');
var config = require('./config.js');

var setup = function(db, io) {
	//checks if a root node exists, and if it doesnt, creates it.
	r.db(config.dbName).table(config.tableName).filter({path: null, _id: '/'}).run(db, function(err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
			if (err) throw err;
			//if length is 0, root node doesn't exist
			if (result.length === 0) {
				//insert root node
				r.db(config.dbName).table(config.tableName).insert({path: null, _id: '/'}).run(db, function(err, cursor) {
					if (err) throw (err);
				});
			}			
		});
	});
 
	//checks if a users node exists, and if it doesnt, creates it
	r.db(config.dbName).table(config.tableName).filter({path: '/', _id: 'users'}).run(db, function(err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
			if (err) throw err;
			//if length is 0, root node doesn't exist
			if (result.length === 0) {
				//insert root node
				r.db(config.dbName).table(config.tableName).insert({path: '/', _id: 'users'}).run(db, function(err, cursor) {
					if (err) throw (err);
				});
			}			
		});
	});
}

exports.setup = setup;
