var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var emitToParent = require('../utils/emitToParent');
var config = require('../config');

exports.setup = function(socket, io) {
	/**
	*@apiGroup set
	*@apiName set
	*@api {socket} Sets a javascript object at the specified url
	*@api {socket} Emits back a [url]-setSuccess signal on success
	*@api {socket} Emits value signal to all parents AND the specified url
	*
	*@apiParam {Object} setRequest An object that contains path, _id, and data as properties
	*@apiParam {String} setRequest._id A string that specifies the key of the javascript object
	*@apiParam {String} setRequest.path A string that specifies which path to add the javascript object as a child of
	*@apiParam {Object} setRequest.data A javascript object to add as a child at the specified path
	*
	*
	*/
	socket.on('set', function(setRequest) {
		// preprocessing here
		//handles edge case when accessing root path
		var urlArray;
		var _idFind;
		var rootString;


		if (setRequest.path === '/') {
			rootString = null;
			_idFind = "/";
			childrenString = '/';
			children_idFind = "";
		}
		//all other paths - this is just string processing to get it into the proper format for querying the db
		else {
			urlArray = setRequest.path.split('/');
			urlArray = urlArray.slice(1,urlArray.length-1);
			rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
			childrenString = rootString;
			_idFind = urlArray[urlArray.length-1];
			children_idFind = urlArray[urlArray.length-1];
		}
		db.connect(function(conn) {
			r.db(config.dbName).table(config.tableName).filter({path: rootString, _id: _idFind}).delete().run(conn, function(err, results) {
				if (err) throw err;
				r.db(config.dbName).table(config.tableName).filter(r.row('path').match(childrenString + children_idFind + "*")).delete().run(conn, function(err, results) {
					var rows = parseToRows(setRequest.data, rootString, _idFind);
					r.table(config.tableName).insert(rows).run(conn, function(err, results) {
						if(err) throw err;
						//emits setSuccess so client to notify client of success
						socket.emit(setRequest.path + '-setSuccess', 'Successfully set data!');
						emitToParent('value', setRequest.path, socket);
					});
				});
			});
		}, setRequest);
	});
}