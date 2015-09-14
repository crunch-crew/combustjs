var r = require('../../db');
var utils = require('../configTest').utils;
var handleError = require('../../rethinkQuery/handleError');
var Promise = require('bluebird');

var resetDb = Promise.coroutine(function* (callback) {
  var result;
  result1 = yield r.db(utils.dbName).table(utils.tableName).delete().run();
  result2 = yield r.db(utils.dbName).table(utils.tableName).insert({path: null, _id: '/'}).run();
  result3 = yield r.db(utils.dbName).table(utils.tableName).insert({path: '/', _id: 'users'}).run();
  callback();
});

module.exports = function(callback) {
  resetDb(callback).catch(function(error) {console.log(error)});
}
