var db = require('../db');
var config = require('../config');
var r = require('rethinkdb');
var bcrypt = require('bcrypt');
module.exports = function(req, res) {
	db.connect(function(conn) {
		//check if username already exists
		r.db(config.dbName).table(config.tableName).filter({path: '/users/', _id: req.body.username}).run(conn, function(err, cursor) {
			if (err) throw err;
			cursor.toArray(function(err, result) {
				if (err) throw err;
				if (result.length === 0) {
					bcrypt.genSalt(config.bcryptRepeat, function(err, salt) {
						bcrypt.hash(req.body.password, salt, function(err, hash) {
							var newUser = {
								path: '/users/',
								_id: req.body.username,
								password: hash,
								email: req.body.email
							};
							r.db(config.dbName).table(config.tableName).insert(newUser).run(conn, function(err, cursor) {
								if (err) throw (err);
								else {
									res.status(201).json(cursor);
								}
							});
						});
					});
				}
				else {
					// TODO: I think this is the wrong error code, lookup the right one
					res.status(401).send("User already exists");
				}
			});				
		});
	});
	
}