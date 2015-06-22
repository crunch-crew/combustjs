var sockets = require('socket.io');
var db = require('./db');
var r = require('rethinkdb');
var parseToRows = require('./utils/parseToRows');
var parseToObj = require('./utils/parseToObj');
var config = require('./config');

var io;
//express server object is passed to this function and it attaches websockets + all the event listeners and handlers
exports.setup = function(server) {
	//this is what actually attaches socket.io to the express server
	io = sockets(server);
	io.on('connection', function(socket) {
		//notify client of successful connection
		socket.emit('connectSuccess', "Socket connection established");

		/**
		*@apiGroup subscribeUrlValue
		*@apiName subscribeUrlValue
		*@api {socket} subscribeUrlValue Request to subscribe to value changed events for a specific url
		*
		*@apiParam {Object} ValueRequest An object that contains url as a property
		*@apiParam {String} ValueRequest.url A string that specifies which url to listen for changed value on
		*@apiSuccess ([path]-subscribeUrlValueSuccess) {Object} successObject object that indicates the url subscription was made
		*@apiSuccess ([path]-subscribeUrlValueSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
		*/
		socket.on('subscribeUrlValue', function(valueRequest) {
			socket.join(valueRequest.url + "-" + "value");
			socket.emit(valueRequest.url + "-subscribeUrlValueSuccess", {success: true});
		});

		/**
		*@apiGroup subscribeUrlChildAdd
		*@apiName subscribeUrlChildAdd
		*@api {socket} subscribeUrlChildAdd Request to subscribe to child added events for a specific url
		*
		*@apiParam {Object} childAddRequest An object that contains url as a property
		*@apiParam {String} childAddRequest.url A string that specifies which url to listen for added children on
		*@apiSuccess ([path]-subscribeUrlChildAddSuccess) {Object} successObject object that indicates the url subscription was made
		*@apiSuccess ([path]-subscribeUrlChildAddSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
		*/
		socket.on('subscribeUrlChildAdd', function(childAddRequest) {
			socket.join(childAddRequest.url + "-" + "childadd");
			socket.emit(childAddRequest.url + "-subscribeUrlChildAddSuccess", {success: true});
		});

		/**
		*@apiGroup subscribeUrlChildRemove
		*@apiName subscribeUrlChildRemove
		*@api {socket} subscribeUrlChildRemove Request to subscribe to child removed events for a specific url
		*
		*@apiParam {Object} ChildRemoveRequest An object that contains url as a property
		*@apiParam {String} ChildRemoveRequest.url A string that specifies which url to listen for removed children on
		*@apiSuccess ([path]-subscribeUrlChildRemoveSuccess) {Object} successObject object that indicates the url subscription was made
		*@apiSuccess ([path]-subscribeUrlChildRemoveSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
		*/
		socket.on('subscribeUrlChildRemove', function(childRemoveRequest) {
			socket.join(childRemoveRequest.url + "-" + "childremove");
			socket.emit(childRemoveRequest.url + "-subscribeUrlChildRemoveSuccess", {success: true});
		});

		/**
		*@apiGroup subscribeUrlChildChange
		*@apiName subscribeUrlChildChange
		*@api {socket} subscribeUrlChildChange Request to subscribe to child changed events for a specific url
		*
		*@apiParam {Object} ChildChangeRequest An object that contains url as a property
		*@apiParam {String} ChildChangeRequest.url A string that specifies which url to listen for changed children on
		*@apiSuccess ([path]-subscribeUrlChildChangeSuccess) {Object} successObject object that indicates the url subscription was made
		*@apiSuccess ([path]-subscribeUrlChildChangeSuccess) {boolean} successObject.success A boolean value indicating if the subscription was successful
		*/
		socket.on('subscribeUrlChildChange', function(childChangeRequest) {
			socket.join(childChangeRequest.url + "-" + "childchange");
			socket.emit(childChangeRequest.url + "-subscribeUrlChildChangeSuccess", {success: true});
		});


		/**
		*@apiGroup getUrl
		*@apiName getUrl
		*@api {socket} getUrl Request a javascript object based on a specified url
		*
		*@apiParam {Object} getUrlRequest An object that contains url as a property
		*@apiParam {String} getUrl.url A string that specifies which url to return the javascript object for
		*@apiSuccess (getSuccess) {Object} getSuccessObject Javascript object that represents the requested url
		*/
		socket.on('getUrl', function(getRequest) {
			//handles edge case when accessing root path
			var urlArray;
			if (getRequest.url === '/') {
				rootString = null;
				_idFind = "/";
			}
			//all other paths - this is just string processing to get it into the proper format for querying the db
			else {
				urlArray = getRequest.url.split('/');
				urlArray = urlArray.slice(1,urlArray.length-1);
				rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
				_idFind = urlArray[urlArray.length-1];
			}
			var rootRow;
			var childrenRows;

			db.connect(function(conn) {
				//query to find root node
				r.db(config.dbName).table(config.tableName).filter({path: rootString, _id:_idFind}).run(conn, function(err, cursor) {
					if (err) throw err;
					cursor.toArray(function(err, result) {
						//first one because query returns an array, even if there is only one result
						rootRow = result[0];
					});
					//query to find all children of root node
					r.db(config.dbName).table(config.tableName).filter(r.row('path').match(getRequest.url+"*")).run(conn, function(err, cursor) {
						if (err) throw err;
						cursor.toArray(function(err, result) {
							childrenRows = result;
							//convert rows into an object
							socket.emit(getRequest.url + "-getSuccess", parseToObj(rootRow, childrenRows));
						});
					});
				});
			});
		});

		/**
		*@apiGroup getUrlChildren
		*@apiName getUrlChildren
		*@api {socket} getUrlChildren Request an array of the javascript objects that are children of the specified url
		*
		*@apiParam {Object} getUrlChildrenRequest An object that contains url as a property
		*@apiParam {String} getUrlChildren.url A string that specifies which url to return the children of
		*@apiSuccess (getUrlChildrenSuccess) {Object} getUrlChildrenSuccessObject A javascript object that contains the children array
		*@apiSuccess (getUrlChildrenSuccess) {Object} getUrlChildrenSuccessObject.children Array of javascript objects that represent the children of the specified url
		*/
		socket.on('getUrlChildren', function(getRequest) {
			//when refering to "children", I think we're only intersted in children of a url that have been "pushed", keys that were "set" or pre-defined
			//probably shouldn't be returned. One way to handle this is to add a filter to teh query that sepcifies that _id should equal id (when things)
			//are added to the db using the push method, the _id field and id field equal each other
			//fill in here
		});

		/**
		*@apiGroup push
		*@apiName push
		*@api {socket} push Add a javascript object as a new child at the specified url
		*
		*@apiParam {Object} pushRequest An object that contains path and data as properties
		*@apiParam {String} pushRequest.path A string that specifies which path to add the javascript object as a child of
		*@apiParam {Object} pushRequest.data A javascript object to add as a child at the specified path
		*
		*@apiSuccess (childAddSuccess) {Object} childAddSuccessObject The javascript object that was added as a child to the specified url
		*@apiSuccess (pushSuccess) {Object} pushSuccessObject Javascript object that contains the generated key
		*@apiSuccess (pushSuccess) {String} pushSuccessObject.key The key generated by the database for the newly pushed item
		*@apiSuccess (pushSuccess) {Boolean} pushSuccessObject.created Boolean value indicating where the push was successful
		*/
		// create a copy of original request if you are RETURNING the original data, parseToRows WILL mutate the original data.
		socket.on('push', function(pushRequest) {
			//makes a copy of the original object - there is probably a better way to do this
			var original = JSON.parse(JSON.stringify(pushRequest));

			db.connect(function(conn) {
				//insert an empty document into the database so that we can get the key back from the database to use later
				r.db(config.dbName).table(config.tableName).insert({}).run(conn, function(err, result) {
					//returns an array even if only once key was made
					var generatedKey = result.generated_keys[0];
					//convert object to be pushed into rows to store in the db
					var rows = parseToRows(pushRequest.data, pushRequest.path, generatedKey);
					var rootRow = rows.slice(rows.length-1)[0];
					var childRows = rows.slice(0,rows.length-1);
					//update the empty document we inserted to contain the properties of the root node/row
					r.db(config.dbName).table(config.tableName).get(generatedKey).update(rootRow).run(conn);
					//insert all the child rows - do these two queries simultaneously because they're not dependent on each other
					r.table(config.tableName).insert(childRows).run(conn, function(err, results) {
						//return the key of the root node back to the user so the can use it for subsequent requests
						socket.emit(original.path + '-pushSuccess', {created: true, key: generatedKey});
						//emit to clients listening for child add events at this url
						io.to(original.path + "-" + "childadd").emit(original.path + "-" + "childaddSuccess", original.data);
					});
				});
			});
		});

		/**
		*@apiGroup set
		*@apiName set
		*@api {socket} set Sets a javascript object at the specified url
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
			}
			//all other paths - this is just string processing to get it into the proper format for querying the db
			else {
				urlArray = setRequest.path.split('/');
				urlArray = urlArray.slice(1,urlArray.length-1);
				rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
				_idFind = urlArray[urlArray.length-1];
			}
			db.connect(function(conn) {
				r.db(config.dbName).table(config.tableName).filter({path: rootString, _id: _idFind}).delete().run(conn);
				r.db(config.dbName).table(config.tableName).filter(r.row('path').match(rootString + _idFind + "/*")).delete().run(conn, function(err, results) {
					var rows = parseToRows(setRequest.data, rootString, _idFind);
					r.table(config.tableName).insert(rows).run(conn, function(err, results) {
						if(err) throw err;
						//emits setSuccess so client to notify client of success
						socket.emit('setSuccess', 'Successfully set data!');
					});
				});
			}, setRequest);
		});
	});
	return io;
};
