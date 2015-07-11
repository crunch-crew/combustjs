var r = require('rethinkdb');
var db = require('../../db');
var insertQuery = require('../../rethinkQuery/insertQuery');
var parseToRows = require('../../utils/parseToRows');

var bulkInsert = function(path, data, callback) {
  var urlArray;
  var _idFind;
  var rootString;
  if (path === '/') {
      rootString = null;
      _idFind = "/";
      childrenString = '/';
      children_idFind = "";
  }
  //all other paths - this is just string processing to get it into the proper format for querying the db
  else {
    urlArray = path.split('/');
    //urlArray will look something like [users, messages, comments]
    urlArray = urlArray.slice(1,urlArray.length-1);

    //sets the rootString which is the path we will use in dbqueries
    rootString = (urlArray.slice(0, urlArray.length - 1).join("/")) + "/";
    _idFind = urlArray[urlArray.length-1];
    childrenString = rootString;
    children_idFind = urlArray[urlArray.length-1];
  }
  var rows = parseToRows(data, rootString, _idFind);
  insertQuery(rows, function(result) {
    callback();
  });
}

module.exports = bulkInsert;