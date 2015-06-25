var db = require('../db');
var config = require('../config');
var r = require('rethinkdb');
var bcrypt = require('bcrypt');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');

module.exports = function(req, res) {
	db.connect(function(conn) {
		//check if username already exists
		r.db(config.dbName).table(config.tableName).filter({path: '/users/', username: req.body.username}).run(conn, function(err, cursor) {
			if (err) throw err;
			cursor.toArray(function(err, result) {
				if (err) throw err;
				if (result.length === 0) {
					bcrypt.genSalt(config.bcryptRepeat, function(err, salt) {
						bcrypt.hash(req.body.password, salt, function(err, hash) {
							var newUser = {
								path: '/users/',
								username: req.body.username,
								password: hash,
								email: req.body.email
							};
							//TODO: copied from push, refactor into one query file later
							r.db(config.dbName).table(config.tableName).insert({}).run(conn, function(err, result) {
								var generatedKey = result.generated_keys[0];
								var rows = parseToRows(newUser, '/users/', generatedKey);
								var rootRow = rows.slice(rows.length-1)[0];
								var childRows = rows.slice(0,rows.length-1);
								r.db(config.dbName).table(config.tableName).get(generatedKey).update(rootRow).run(conn, function(err, results) {
									r.table(config.tableName).insert(childRows).run(conn, function(err, results) {
										if (err) throw err;
										else {
											console.log("sent success");
											res.status(201).json({
												success: true
											});
										}
									});
								});
							});
							// r.db(config.dbName).table(config.tableName).insert(newUser).run(conn, function(err, cursor) {
							// 	if (err) throw (err);
							// 	else {
							// 		res.status(201).json({
							// 			success: true
							// 		});
							// 	}
							// });
						});
					});
				}
				else {
					// TODO: I think this is the wrong error code, lookup the right one
					res.status(401).send({success: false});
				}
			});				
		});
	});
	
}