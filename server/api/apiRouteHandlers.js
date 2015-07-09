var getQuery = require('../rethinkQuery/getQuery');
var apiToPath = require('./apiToPath');

var getRoute = function(req, res) {
  getQuery(apiToPath(req.url), function(getQueryResult) {
    res.status(200).json(getQueryResult);
  });
};

exports.getRoute = getRoute;

