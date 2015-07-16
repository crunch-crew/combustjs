var r = require('../db');
var config = require('../config');
var parseToObj = require('../utils/parseToObj');
var handleError = require('./handleError');

var getNestedQuery = function(path, callback) {
   //handles edge case when accessing root path
  var urlArray;
  if (path === '/') {
    rootString = null;
    _idFind = "/";
  }
  //all other paths - this is just string processing to get it into the proper format for querying the db
  else {
    urlArray = path.split('/');
    urlArray = urlArray.slice(0,urlArray.length-1);
    rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
    _idFind = urlArray[urlArray.length-1];
  }
  var rootRow;
  var childrenRows;

  r.db(config.dbName).table(config.tableName).filter({path: rootString, _id:_idFind}).run().then(function(result) {
    //first one because query returns an array, even if there is only one result
    rootRow = result[0];
    //query to find all children of root node
    r.db(config.dbName).table(config.tableName).filter(r.row('path').match(path + '*')).run().then(function(result) {
      childrenRows = result;
      if(callback) {
        callback(parseToObj(rootRow, childrenRows));
      }
    });
  }).error(handleError);
};

module.exports = getNestedQuery;