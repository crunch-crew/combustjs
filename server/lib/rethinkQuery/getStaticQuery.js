var r = require('../db');
var config = require('../config');
var getParent = require('../utils/getParent');
var getLastKey = require('../utils/getLastKey');
var handleError = require('./handleError');

var getStaticQuery = function(path, callback) {
  var parentPath;
  var parentId;
  var key = getLastKey(path);
  //root edge case
  if (getParent(path) === '/') {
    parentPath = null;
    parentId = '/';
  }
  //string processing to query for parent node - need path of grandparent and id of parent
  else {
    parentPath = getParent(getParent(path));
    parentId = getLastKey(getParent(path));
  }
  //query to find parent node - check if static property
  r.db(config.dbName).table(config.tableName).filter({path: parentPath, _id: parentId}).run()
  .then(function(result) {
    if (result[0] && (key in result[0])) {
      if (callback) {
        callback(result[0][key]);
      }
    }
    else {
      callback(null);
    }
  })
  .error(handleError);
}

module.exports = getStaticQuery;