var r = require('rethinkdb');
var config = require('./config.js');

//checks if a root node exists, and if it doesnt, creates it.
var setup = function(db, io) {
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
}

exports.setup = setup;
