var checkPermissions = require('./checkPermissions');
var dbQuery = require('./dbQuery');

module.exports = function(permissionType, path, user, callback) {
  //get url object before checking permissions so it can be used in rules as a token
  dbQuery('get', path, function(parsedObj) {
    var permission = checkPermissions({
      path: path,
      user: user,
      data: parsedObj
    });
    callback(permission[permissionType]);
  });
} 