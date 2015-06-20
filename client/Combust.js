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
		callback();
	});
	this.socket.emit('push', {path: this.constructPath(), data: object});

	return newRef;
}

module.exports = Combust;