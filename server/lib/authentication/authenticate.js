var r = require('../db');
var config = require('../config');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

//TODO: need to index username property
module.exports = function(req, res) {
	r.db(config.dbName).table(config.tableName).filter({path: '/users/', username: req.body.username}).run().then(function(result) {
		if (result.length === 0) {
			res.status(400).json({success: false});
		}
		else {
			bcrypt.compare(req.body.password, result[0].password, function(err, same) {
				if (err) throw err;
				if (same) {
					//send back entire user object, except for password
					delete result[0].password;
					var token = jwt.sign(result[0], config.jwtSecret, {expiresInMinutes: config.tokenExpireMinutes});
					res.status(200).json({
						success: true,
						id: result[0].id,
						token: token
					});
				}
				else {
					res.status(400).json({
						success: false
					});
				}
			});
		}
	});				
};
