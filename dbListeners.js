// var db = require('./db');
var r = require('rethinkdb');
// var io = require('./socketSetup').io();
// var io = require('./server').io;


var setup = function(db, io) {
console.log("in db listener, io is ", io)
	r.db('test').tableList().run(db, function(err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
			if (err) throw err;
			console.log("tables in db:", JSON.stringify(result));

			result.forEach(function(tableName) {
				r.table(tableName).changes().run(db, function(err, cursor) {
					cursor.each(function(err, change) {
						console.log("chhange is:", change);
						console.log("before emitting, room is:", io.nsps['/'].adapter.rooms[tableName]);
						io.to(tableName).emit('tableChange',change);
						console.log("emitted to ", tableName);
					});
				})
			})
		})
	})
}

exports.setup = setup;
