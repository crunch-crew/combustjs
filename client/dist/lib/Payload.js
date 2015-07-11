
var Payload = function(data) {
  this._storage = data;
};

Payload.prototype.val = function() {
  return this._storage;
};

Payload.prototype.forEach = function(callback) {
  if (Array.isArray(this._storage)) {
    for (var i = 0; i < this._storage.length; i++) {
      callback(new Payload(this._storage[i]));
    }
  }
  else if (this._storage) {
    callback(this._storage);
  }
};

module.exports = Payload;