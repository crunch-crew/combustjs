var db = require('../db');
var config = require('../config');
var r = require('rethinkdb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

//TODO: need to index username property
module.exports = function(req, res) {
	db.connect(function(conn) {
		r.db(config.dbName).table(config.tableName).filter({path: '/users/', username: req.body.username}).run(conn, function(err, cursor) {
			if (err) throw err;
			cursor.toArray(function(err, result) {
				if (err) throw err;
				if (result.length === 0) {
					res.status(400).send("Invalid credentials");
				}
				else {
					bcrypt.compare(req.body.password, result[0].password, function(err, same) {
						if (err) throw err;
						if (same) {
							console.log("Password matches!");
							var token = jwt.sign(result[0], config.jwtSecret, {expiresInMinutes: config.tokenExpireMinutes});
							res.status(200).json({
								success: true,
								id: result[0].id,
								token: token
							});
						}
						else {
							console.log("Password doesn't match");
							res.status(400).json({
								success: false
							});
						}
					})
				}
			});				
		});
	});
}