var getQuery = require('../rethinkQuery/getQuery');
var apiToPath = require('./apiToPath');

/**
*@apiGroup REST API
*@apiName GET
*@api {GET} /api/* Request JSON data for a specified path.
*
*@apiSuccess {JSON} pathData JSON data that represents the data at the requested path.
*/
var getRoute = function(req, res) {
  getQuery(apiToPath(req.url), function(getQueryResult) {
    res.status(200).json(getQueryResult);
  });
};

exports.getRoute = getRoute;

