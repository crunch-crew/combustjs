/* test-code */
/* end-test-code */

var Payload = function(data, path) {
  this._storage = data || null;
  this._ref = path;
  console.log(" path is : ", this._ref, " and data is: ", this._storage);
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
  return (this._storage !== null && this._storage !== undefined);
};

Payload.prototype.numChildren = function() {
  return Object.keys(this._storage).length;
};

Payload.prototype.hasChild = function(childPath) {
  console.log("in hasChild PATH is  : ", childPath );
  console.log("in hasChild isolateData returns : ", isolateData(childPath, this._storage));
  console.log("in hasChild keys : ", Object.keys(isolateData(childPath, this._storage)));

  return (Object.keys(isolateData(childPath, this._storage)).length > 0);
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

// module.exports = Payload;