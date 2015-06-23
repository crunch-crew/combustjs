var r = require('rethinkdb');

var connect = function(callback, param) {
	r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
	    if (err) throw err;
		callback(conn, param);
	});
};

exports.connect = connect;