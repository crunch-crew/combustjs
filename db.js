var r = require('rethinkdb');
// var dbListeners = require('./dbListeners');


var connect = function(callback, param) {
	r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
	    if (err) throw err;
	    connection = conn;
	 //    console.log("testing db:", r.db('test').table("authors").run(connection, function(err, cursor) {
		// if (err) throw err;
		// cursor.toArray(function(err, result) {
		// 	if (err) throw err;
		// 	console.log(JSON.stringify(result));
		// })
	// }));
		// dbListeners.setup(connection, io);
		callback(conn, param);
	})
}

exports.connect = connect;