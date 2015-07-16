var r = require('../../db');
var utils = require('../configTest').utils;
var handleError = require('../../rethinkQuery/handleError');

var resetDb = function(callback) {
  r.db(utils.dbName).table(utils.tableName).delete().run()
  .then(function(result) {
    return r.db(utils.dbName).table(utils.tableName).insert({path: null, _id: '/'}).run()
  }).then(function(result) {
    return r.db(utils.dbName).table(utils.tableName).insert({path: '/', _id: 'users'}).run()
  }).then(function(result) {
    callback();
  }).error(handleError);
}

module.exports = resetDb;