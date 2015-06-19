var r = require('rethinkdb');

//initializes the db listeners
var setup = function(db, io) {
	//get a list of all tables in database
	r.db('test').tableList().run(db, function(err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
			if (err) throw err;
			//add a listener for each table in database
			result.forEach(function(tableName) {
				r.table(tableName).changes().run(db, function(err, cursor) {
					cursor.each(function(err, change) {
						if (err) throw err;
						//emit changes to all clients subscribed to that room
						io.to(tableName).emit('tableChange', change);
					});
				})
			})
		})
	})
}

var addListener = function(db, io, url) {
	r.db('test').table('yolo').filter({})
}

exports.setup = setup;
