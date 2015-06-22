/**
* Combust class always maintains a path to part of the database and has various methods for reading and writing data to it,
* as well as listening for changes in data at the specified path.
*
*@class Combust
*
*@constructor
*/
var Combust = function(options) {
	this.dbName = options.tableName || 'test';
	this.tableName = options.tableName || 'test';
	this.socket = options.socket;
	this.pathArray = ['/'];
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
* Sets an object at the current path.
*
*@method set
*
*@param object {Object} object The object to set at the current path.
*@param *callback {Callback} callback The callback to be executed once the object has been set at the path in the database. Optional parameter.
*
*/

/* Takes in an object to be set at path. Does not return anything. */
Combust.prototype.set = function(object, callback) {
	var newRef = new Combust({
		dbName: this.dbName,
		tableName: this.tableName,
		socket: this.socket
	});

	this.socket.once(this.constructPath() + '-setSuccess', function(data) {
		if (callback) {
			callback(data);
		}
	});
	this.socket.emit('set', {path: this.constructPath(), data: object});
};

/**
* Creates an event listener for a specified event at the current path.
*
*@method on
*
*@param eventType {String} eventType The type of event to listen for at the current path.
*@param *callback {Function} callback(newChild) The callback to be executed once the specified event is triggered. Accepts the new child as the only parameter.
*/
Combust.prototype.on = function(eventType, callback) {
	//set it here incase path changes before getSuccess is executed
	var path = this.constructPath();
	//this binding is lost in async calls so store it here
	var socket = this.socket;
	//this might cause a bug...what if there are multiple getSuccesses and you capture the wrong one?
	if (eventType === "child_add") {
		socket.emit("subscribeUrlChildAdd", {url: path});
		socket.once(path + '-subscribeUrlChildAddSuccess', function() {
			//need a get children method - not desired functionality as written
			socket.emit('getUrl', {url: path});
		});
		socket.once(path + "-getSuccess", function(data) {
			//once get children method is written, call callback on all children.
			/*once all current children have been received, as listener for new ones - this might cause an issue if a child is added inbetween
			recieving the latest children and adding the listener.
			*/
			socket.on(path + '-childaddSuccess', function(data) {
				//call callback on new child
				callback(data);
			});
		});
	}
};

module.exports = Combust;