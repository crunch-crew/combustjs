var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var emitToParent = require('../utils/emitToParent');

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
		//Obtain the rows in the udpate payload from the request
		var rows = parseToRows(updateRequest.data, rootString, _idFind);
		// connect and keep it on to process entire payload
		db.connect(function(conn) {
			var counter = 0;
			// use an internal counter to address issues with async nature of this code
			var updateOrInsert = function() {
				r.db(config.dbName).table(config.tableName).filter({path: rows[counter].path, _id: rows[counter]._id}).update(rows[counter], {returnChanges: false
				}).run(conn, function(err, results){

					if (err) throw err;
					
					// Insert those rows for which were not replaced AND were not changed during the update attempt
					if (!results.replaced && !results.unchanged){
						r.table(config.tableName).insert(rows[counter]).run(conn, function(err, results){
							if (err) throw err;
							emitToParent('child_added', updateRequest.path, socket, rows[counter]);
						});
					} else {
						//this was an update; refine it further based on the attributes in results
						// for now simply emit child changed
						emitToParent('child_changed', updateRequest.path, socket, rows[counter]);
					}
					counter++;
					if (counter < rows.length) {
						// Invoke this function for each of the rows in the payload
						updateOrInsert(); 
					}
					if (counter === rows.length -1) {
						//emit the success event back to the user and any response here for use for subsequent requests by client
						socket.emit(updateRequest.path + '-updateSuccess', {updated: true});
						//emit to clients listening for value event at this url
						// emitToParent('child_changed', updateRequest.path, socket);
					}
				});
			};
			updateOrInsert();
		});
	});
}