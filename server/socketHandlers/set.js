var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var emitToParent = require('../utils/emitToParent');
var dbQuery = require('../utils/dbQuery');
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
		var incompletePath = false;
		var neededParents = [];

		db.connect(function(conn) {
			dbQuery('get', '/', function(rootObject) {
				if (setRequest.path === '/') {
					rootString = null;
					_idFind = "/";
					childrenString = '/';
					children_idFind = "";
				}
				//all other paths - this is just string processing to get it into the proper format for querying the db
				else {
					urlArray = setRequest.path.split('/');
					//urlArray will look something like [users, messages, comments]
					urlArray = urlArray.slice(1,urlArray.length-1);

					for(var i = 0; i < urlArray.length - 1; i++) {
						//iterates through urlArray and checks to see if the properties in urlArray exist in our current database.
						if(!rootObject[urlArray[i]]) {
							//keeps track of a variable called "incompletePath" that we will use later. Also pushes the props we need to create
							incompletePath = true;
							neededParents.push(urlArray[i]);
						}
					}
					//sets the rootString which is the path we will use in dbqueries
					rootString = (urlArray.slice(0, urlArray.length - 1 - neededParents.length).join("/")) + "/";
					_idFind = urlArray[urlArray.length-1];
					childrenString = rootString;
					children_idFind = urlArray[urlArray.length-1];
				}	
							
				if(!incompletePath) {
					//if in here, it means that the database contains all parent paths leading up to our target path
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
				}
				else {
					//starts by building an empty object
					var buildObj = {};
					//currentPoint will deeper and deeper into our buildObj as we start building all the missing path to our target path
					var currentPointer = buildObj;
					//iterates through the parents we need to build
					for(var j = 1; j < neededParents.length; j++) {
						currentPointer = currentPointer[neededParents[j]] = {};
					}
					//finally after we have built all the parents sets our path id as a property in the parent row
					currentPointer[_idFind] = rootObject;
					//we parse the whole obj that we are building into rows so it can be inserted into db
					//ie. if we were setting an object at /users/message/ and users doesn't exist,
					//buildObj would equal {message: sldfksdlf}
					//rootString would be '/'
					//neededParents[0] would be the _id which is 'users'
					var rows = parseToRows(buildObj, rootString, neededParents[0]);
					r.table(config.tableName).insert(rows).run(conn, function(err, results) {
						if(err) throw err;
						socket.emit(setRequest.path+'-setSuccess', 'Successfully set data!');
						emitToParent('value', setRequest.path, socket);
					});
				}
			});
		});
	});
};
