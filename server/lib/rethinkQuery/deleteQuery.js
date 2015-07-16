var r = require('../db');
var config = require('../config');
var handleError = require('./handleError');

//is passed an object that includes a path prop and _id prop and a callback function
var deleteQuery = function(path, callback) {
  r.db(config.dbName).table(config.tableName).filter(path).delete().run()
  .then(function(results) {
    if(callback) {
      callback(results);
    }
  })
  .error(handleError);
};

module.exports = deleteQuery;