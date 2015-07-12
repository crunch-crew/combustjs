/* test-code */
/* end-test-code */

var isolateData = require('./isolateData');

var Payload = function(data, path) {
  this._storage = data || null;
  this._ref = path;
};

Payload.prototype.val = function() {
  return this._storage;
};

Payload.prototype.forEach = function(callback) {
  if (Array.isArray(this._storage)) {
    for (var i = 0; i < this._storage.length; i++) {
      callback(new Payload(this._storage[i], this._ref));
    }
  }
  else if (this._storage) {
    callback(this._storage);
  }
};

Payload.prototype.exists = function(){
  return (this._storage !== null) ;
};

Payload.prototype.hasChildren = function() {
  return (this._storage !== null && this._storage !== undefined && Object.keys(this._storage).length > 0);
};

Payload.prototype.numChildren = function() {
  if (this._storage !== null && this._storage !== undefined) {
    return Object.keys(this._storage).length;
  }
  else {
    return 0;
  }
};

Payload.prototype.hasChild = function(childPath) {
  return isolateData(childPath, this._storage) !== undefined;
};

Payload.prototype.child = function(childPath) {
  var data = isolateData(childPath, this._storage);
  if (data) {
    data._ref = childPath;
  }
  return data;
};

Payload.prototype.ref = function(){
  return this._ref;
};

module.exports = Payload;