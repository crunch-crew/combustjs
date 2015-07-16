var r = require('../db');
var config = require('../config');
var parseToObj = require('../utils/parseToObj');
var getParent = require('../utils/getParent');
var getLastKey = require('../utils/getLastKey');
var getNestedQuery = require('./getNestedQuery');
var getStaticQuery = require('./getStaticQuery');
// var parseToRows = require('../utils/parseToRows');

var getQuery = function(path, callback) {
  if (path !== '/') {
    getStaticQuery(path, function(staticResult) {
      if (staticResult !== null) {
        callback(staticResult);
      }
      else {
        getNestedQuery(path, function(nestedResult) {
          callback(nestedResult);
        });
      }
    });
  }
  else {
    getNestedQuery(path, function(nestedResult) {
      callback(nestedResult);
    });
  }
};

module.exports = getQuery;
