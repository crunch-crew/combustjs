module.exports = function(app, port) {
  var db = require('./lib/db');
  var dbListeners = require('./lib/dbListeners');
  var sockets = require('socket.io');
  var jwt = require('jsonwebtoken');
  var parser = require('body-parser');
  var config = require('./lib/config');
  var r = require('rethinkdb');
  var bcrypt = require('bcrypt');
  var apiRouteHandlers = require('./lib/api/apiRouteHandlers');

  app.use(parser.json());

  //cors
  var cors = require('cors');
  app.use(cors());

  var socketSetup = require('./lib/socketSetup');

  //authentication 
  var signup = require('./lib/authentication/signup');
  var authenticate = require('./lib/authentication/authenticate');
  app.post('/signup', signup);
  app.post('/authenticate', authenticate);

  //api
  app.get('/api*', apiRouteHandlers.getRoute); 

  var server = app.listen(port);
  //layers socket.io ontop of the express server
  var io = socketSetup.setup(server);

  //ensures db has root nodes
  db.connect(dbListeners.setup);
  
  console.log("Express server listening on %d in %s mode", port, app.settings.env);
 
  return server;
}