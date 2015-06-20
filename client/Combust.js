var Combust = function(options) {
	this.dbName = options.tableName || 'test';
	this.tableName = options.tableName || 'test';
	this.socket = options.socket;
	this.pathArray = ['/'];
}

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
}

Combust.prototype.child = function(childName) {
	this.pathArray.push(childName);
	return this;
}

/* returns a new object combust reference immediately, but once it receives the new key from the database
it updates the returned combust reference with the proper path */
Combust.prototype.push = function(object, callback) {
	var newRef = new Combust({
		dbName: this.dbName,
		tableName: this.tableName,
		socket: this.socket
	});

	this.socket.once('pushSuccess', function(data) {
		newRef.child(data.key);
		if (callback) {
			callback(data);
		}
	});
	this.socket.emit('push', {path: this.constructPath(), data: object});
	// console.log("pushed to this path: ", this.constructPath());

	return newRef;
}

Combust.prototype.on = function(eventType, callback) {
	//set it here incase path changes before getSuccess is executed
	var path = this.constructPath();
	//this binding is lost in async calls so store it here
	var socket = this.socket;
	//this might cause a bug...what if there are multiple getSuccesses and you capture the wrong one?
	if (eventType === "addchild") {
		socket.emit("subscribeUrlChildAdd", {url: path});
		socket.on('subscribeUrlChildAddSuccess', function() {
			//need a get children method
			socket.emit('getUrl', {url: path});
		})
		socket.once("getSuccess", function(data) {
			//Need a get children method
			// for (var key in data) {
			// 	callback(data[key]);
			// }
			socket.on(path + '-childaddSuccess', function(data) {
				// console.log("successfully subscribed");
				callback(data);
			});
		});
	}
}

module.exports = Combust;