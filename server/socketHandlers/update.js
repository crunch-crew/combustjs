var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');

exports.setup = function(socket, io) {
	/**
	*@apiGroup update
	*@apiName update
	*@api {socket} update Updates the javascript object at the specified url and may involve update, insert of remove tasks on exisiting objects
	*
	*@apiParam {Object} updateRequest An object that contains path, _id, and data as properties
	*@apiParam {String} updateRequest._id A string that specifies the key of the javascript object
	*@apiParam {String} updateRequest.path A string that specifies which path to add the javascript object as a child of
	*@apiParam {Object} updateRequest.data A javascript object that has updates that are to be applied at the specified path
	*
	*/
	socket.on('update', function(updateRequest) {
		// preprocessing here
		var urlArray;
		var _idFind;
		var rootString;

		if (updateRequest.path === '/') {
			rootString = null;
			_idFind = "/";
		}
		//all other paths - this is just string processing to get it into the proper format for querying the db
		else {
			urlArray = updateRequest.path.split('/');
			urlArray = urlArray.slice(1,urlArray.length-1);
			rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
			_idFind = urlArray[urlArray.length-1];
		}

		db.connect(function(conn) {
			var rows = parseToRows(updateRequest.data, rootString, _idFind);
			// get the rows from updateRequest
			for (var i = 0; i < rows.length; i++ ){
				//if row is found - update it
				r.db(config.dbName).table(config.tableName).filter({path: rows[i].path, _id: rows[i]._id}).update(rows[i]).run(conn, function(err, results){
					// if no row is selected for update; a record should be inserted - we'd likely get an error on update n such cases
					if (err){
						r.table(config.tableName).insert(rows[i]).run(conn, function(err, results){
							if (err) throw err;
							console.log('record inserted during update : ', results);
						});
					} else {
						console.log("updated ", results);
					}
				});
			} // end for
			socket.emit(updateRequest.path + '-setSuccess', 'Successfully updated data!'); // needs to be updated to bubble up 
		
		}, updateRequest);

	});
}