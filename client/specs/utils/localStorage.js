//simulates browser localStorage for testing purposes
var localStorage = function() {
  this._storage = {};
}
localStorage.prototype.setItem = function(key, value) {
  this._storage[key] = value;
};
localStorage.prototype.getItem = function(key) {
  //if key exists, return value, otherwise return null
  return this._storage[key] ? this._storage[key] : null;
};
localStorage.prototype.removeItem = function(key) {
  delete this._storage[key];
}

module.exports = function() {
  return new localStorage();
}