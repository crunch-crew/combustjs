var getQuery = require('../rethinkQuery/getQuery');
var apiToPath = require('./apiToPath');

/**
*@apiGroup REST API
*@apiName GET
*@api {GET} /api/* Request JSON data for a specified path. Anything after '/api/' will be interpreted as the path. For example, '/api/users/' will return
*all the users in the database. Requesting '/api/' by itself will return root.
*
*@apiSuccess {JSON} pathData JSON data that represents the data at the requested path.
*/
var getRoute = function(req, res) {
  getQuery(apiToPath(req.url), function(getQueryResult) {
    res.status(200).json(getQueryResult);
  });
};

exports.getRoute = getRoute;

