var r = require('../db');
var config = require('../config');
var bcrypt = require('bcrypt');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');

module.exports = function(req, res) {
	//check if username already exists
	r.db(config.dbName).table(config.tableName).filter({path: '/users/', username: req.body.username}).run().then(function(result) {
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
					r.db(config.dbName).table(config.tableName).insert({}).run().then(function(result) {
						var generatedKey = result.generated_keys[0];
						var rows = parseToRows(newUser, '/users/', generatedKey);
						var rootRow = rows.slice(rows.length-1)[0];
						var childRows = rows.slice(0,rows.length-1);
						r.db(config.dbName).table(config.tableName).get(generatedKey).update(rootRow).run().then(function(results) {
							r.table(config.tableName).insert(childRows).run().then(function(results) {
								res.status(201).json({
									id: generatedKey,
									success: true
								});
							})
						});
					});
				});
			});
		}
		else {
			// TODO: I think this is the wrong error code, lookup the right one
			res.status(401).send({success: false});
		}
	});				
};