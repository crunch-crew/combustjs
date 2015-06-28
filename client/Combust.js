//required for testing only - remove in production
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var io = require('socket.io-client');

/**
* Combust class always maintains a path to part of the database and has various methods for reading and writing data to it,
* as well as listening for changes in data at the specified path.
*
*@class Combust
*
*@constructor
*/
var Combust = function(options, callback) {
	this.callback = callback || function() {};
	this.auth = options.auth || null;
	this.serverAddress = options.serverAddress || null;
	this.dbName = options.tableName || 'test';
	this.tableName = options.tableName || 'test';
	//manage socket connection
	if (options.socket) {
		this.socket = options.socket;
	}
	else if (this.serverAddress) {
		this.socket = this.connectSocket(this.callback);
	}
	else {
		this.socket = null;
	}
	// this.io = options.io || null;
	this.pathArray = ['/'];
	//could check local storage to see if a token exists there
	this.token = null;
};

//create socket connection to server
Combust.prototype.connectSocket = function(callback) {
	if (this.auth) {
		this.authenticate(this.auth, function(response) {
			this.socket = io.connect(this.serverAddress, {
				forceNew: true,
	      //send the web token with the initial websocket handshake
	      query: 'token=' + response.token
	    });
	    this.token = response.token;
			this.socket.on('connectSuccess', function() {
	    	callback(response);
			});
		}.bind(this));
	}
	else {
		this.socket = io.connect(this.serverAddress, {
			forceNew: true
		});
    this.socket.on('connectSuccess', function() {
    	callback();
		});
	}
};

/* this method doesn't have documentation because its an internal method that the user should not use.
	 Converts the pathArray variable into a string that can be used by other methods to interact with the server
*/
Combust.prototype.constructPath = function() {
	var path;
	if (this.pathArray[0] === '/' && this.pathArray.length === 1) {
		return '/';
	}
	else if (this.pathArray[0] === '/') {
		path = this.pathArray.slice(1);
	}
	else {
		path = this.pathArray;
	}
	return "/" + path.join('/') + '/';
};

/**
* Change the path of the Combust object to point to one of the children of the current path.
* Method is chainable.
*
*@method child
*
*@param childName {String} childName Name of the child of the current path to point Combust at
*@return {Object} Returns a mutated instance of the same Combust instance so that it can be chained.
*/

//consider changing this method so that it returns a new Combust object instead of mutating the existing one
Combust.prototype.child = function(childName) {
	this.pathArray.push(childName);
	return this;
};

/**
* Pushes an object as a new child at the current path.
*
*@method push
*
*@param object {Object} object The object to push as a new child at the current path.
*@param *callback {Callback} callback The callback to be executed once the new child has been synchronized with the database. Optional parameter.
*
*@return {Object} Returns a new instance of Combust that points to the path of the newly created child.
*/

/* returns a new object combust reference immediately, but once it receives the new key from the database
it updates the returned combust reference with the proper path */
Combust.prototype.push = function(object, callback) {
	var newRef = new Combust({
		dbName: this.dbName,
		tableName: this.tableName,
		socket: this.socket
	});
	// newRef.token = this.token;

	this.socket.once(this.constructPath() + '-pushSuccess', function(data) {
		newRef.child(data.key);
		if (callback) {
			callback(data);
		}
	});
	this.socket.emit('push', {path: this.constructPath(), data: object});

	return newRef;
};

/**
* Deletes an object at the current path.
*
*@method delete
* 
*@param object {Object} object The object to delete at the current path.
*@param *callback {Callback} callback The callback to be executed once the object has been deleted at the path in the database. Optional parameter.
*
*/

// Takes in an object to be set at a path and emits an event to the server
Combust.prototype.delete = function(object, callback) {
	var newRef = new Combust({
		dbName: this.dbName,
		tableName: this.tableName,
		socket: this.socket
	});
	var path = this.constructPath();

	this.socket.once(path + '-deleteSuccess', function(data){
		if (callback) {
			callback(data);
		}
	});
	this.socket.emit('delete', {path: path, data: object}); 
};

/**
* Sets an object at the current path.
*
*@method set
*
*@param object {Object} object The object to set at the current path.
*@param *callback {Callback} callback The callback to be executed once the object has been set at the path in the database. Optional parameter.
*
**/

/* Takes in an object to be set at path. Does not return anything. */
Combust.prototype.set = function(object, callback) {
	var newRef = new Combust({
		dbName: this.dbName,
		tableName: this.tableName,
		socket: this.socket
	});
	//transfer token
	newRef.token = this.token;

	this.socket.once(this.constructPath() + '-setSuccess', function(data) {
		if (callback) {
			callback(data);
		}
	});
	this.socket.emit('set', {path: this.constructPath(), data: object});
};


/**
* Updates object at the current path.
*
*@method update
*
*@param object {Object} object The object to update the existing object at the current path.
*@param *callback {Callback} callback The callback to be executed once the object has been updated at the path in the database. Optional parameter.
*
*/

/* Takes in an object to update existing object at path in database. #### TBD - WHAT to return ###### */
Combust.prototype.update = function(object, callback) {
	var newRef = new Combust({
		dbName: this.dbName,
		tableName: this.tableName,
		socket: this.socket
	});

	this.socket.once(this.constructPath() + '-updateSuccess', function(data) {
		if (callback) {
			callback(data);
		}
	});
	this.socket.emit('update', {path: this.constructPath(), data: object});
};


/**
* Creates an event listener for a specified event at the current path.
*
*@method on
*
*@param eventType {String} eventType The type of event to listen for at the current path - currently supported values are "child_added", "child_changed", "child_removed", "value"
*@param *callback {Function} callback(newChild) The callback to be executed once the specified event is triggered. Accepts the new child as the only parameter.
*/
Combust.prototype.on = function(eventType, callback) {
	//set it here incase path changes before getSuccess is executed
	var path = this.constructPath();
	//this binding is lost in async calls so store it here
	var socket = this.socket;
	//this might cause a bug...what if there are multiple getSuccesses and you capture the wrong one?
	if (eventType === "child_added") {
    socket.once(path + '-subscribeUrlChildAddSuccess', function() {
      //need a get children method - not desired functionality as written
      socket.emit('getUrlChildren', {url: path});
    });
    socket.once(path + "-getUrlChildrenSuccess", function(data) {
      //calls callback on all current child
      //getUrlChildren will return an array of Objects, ie. [{key1: 1}, {key2:{inkey:2}}, {key3: true}]
      data.forEach(function(child) {
        callback(child);
      });
      socket.on(path + '-childaddSuccess', function(data) {
        //call callback on new child
        callback(data);
      });
    });
		socket.emit("subscribeUrlChildAdd", {url: path});
	}
	// the client side method that enables execution of callback with child_changed response
	if (eventType === "child_changed") {
    socket.once(path + '-subscribeUrlChildChangeSuccess', function() {
      //listens to completion of subscribe event on server
      //TODO: Revisit the getUrlChildren after the sync strategy is confirmed
      socket.emit('getUrlChildren', {url: path});
      //emit for getUrlChildren action on server; for the 'path'
    });
    socket.once(path + "-getUrlChildrenSuccess", function(data) {
      //listens to getChildren Success and executes callback on all current children; does this first time
      //getUrlChildren will return an array of Objects, ie. [{key1: 1}, {key2:{inkey:2}}, {key3: true}]
      data.forEach(function(child) {
        callback(child);
      });
      socket.on(path + '-childchangeSuccess', function(data) {
        //continues to listen to child change events and executes callback with returned data
        callback(data);
      });
    });
		socket.emit("subscribeUrlChildChange", {url: path});
		// emits for registeration of subscribe event at the path on server handler
	}
	// the client side method that enables execution of callback with child_changed response
	if (eventType === "value") {
    socket.once(path + '-subscribeUrlValueSuccess', function() {
      //listens to completion of subscribe event on server
      //TODO: Revisit the getUrlChildren after the sync strategy is confirmed
      socket.emit('getUrlChildren', {url: path});
      //emit for getUrlChildren action on server; for the 'path'
    });
    socket.once(path + "-getUrlChildrenSuccess", function(data) {
      //listens to getChildren Success and executes callback on all current children; does this first time
      //getUrlChildren will return an array of Objects, ie. [{key1: 1}, {key2:{inkey:2}}, {key3: true}]
      data.forEach(function(child) {
        callback(child);
      });
      // confirm what should this be --- 
      socket.on(path + '-value', function(data) {
        //continues to listen to child change events and executes callback with returned data
        callback(data);
      });
    });
		socket.emit("subscribeUrlValue", {url: path});
		// emits for registeration of subscribe event at the path on server handler
	}
};

Combust.prototype.newUser = function(newUser, callback) {
	//raw http requests
	var xhr = new XMLHttpRequest();
	xhr.open('POST', encodeURI('http://0.0.0.0:3000/signup'));
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
		response = JSON.parse(xhr.responseText);
		response.status = xhr.status;
		callback(response);
		// if (xhr.status === 201) {
		// 	callback(response);
		// }
		// else if (xhr.status === 401) {
		// 	console.log(xhr.responseText);

		// }
		// else {
		// 	console.log(xhr.responseText);
		// }
	}.bind(this);
	xhr.send(JSON.stringify(newUser));
};

//storing token in instance of object for now, should it be stored in local storage?
Combust.prototype.authenticate = function(credentials, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', encodeURI('http://0.0.0.0:3000/authenticate'));
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
		response = JSON.parse(xhr.responseText);
		response.status = xhr.status;
		this.token = response.token;
		callback(response);
	}.bind(this);
	xhr.send(JSON.stringify(credentials));
};

// Combust.prototype.connectSocket = function() {
// 	var io = this.io;
// 	var serverAddress = this.serverAddress;
// 	var token = this.token;
// 	this.socket = io.connect(serverAddress, {
// 		//send the web token with the initial websocket handshake
// 		query: 'token=' + token
// 	});
// }

module.exports = Combust;