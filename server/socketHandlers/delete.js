var db = require('../db');
var r = require('rethinkdb');
var emitToParent = require('../utils/emitToParent');
var config = require('../config');

exports.setup = function(socket, io) {
  socket.on('delete', function(deleteRequest) {
    console.log('DELETE REQUEST', deleteRequest);
    var urlArray,
        _idFind,
        rootString;
    if (deleteRequest.path === '/') {
      rootString = null; 
      _idFind = '/';
    } else {
      console.log('deleteRequest before split:', deleteRequest);
      urlArray = deleteRequest.path.split('/');
      urlArray.slice(1, urlArray.length - 1);
      console.log("after string manipulation, urlArray is: ", urlArray);
      rootString = (urlArray.slice(0, urlArray.length - 1).join('/')) + '/';
      _idFind = urlArray[urlArray.length - 1];
      db.connect(function(conn) {
        r.db(config.dbName).table(config.tableName).filter({path: rootString, _id: _idFind}).delete().run(conn);
        r.db(config.dbName).table(config.tableName).filter(r.row('path').match(rootString + _idFind + '/*')).delete().run(conn, function(err, results) {
          if (err) throw err;
          console.log("emitting to: ", deleteRequest.path + '-deleteSuccess');
          socket.emit(deleteRequest.path + '-deleteSuccess', 'Data has successfully been deleted!');
          emitToParent('value', deleteRequest.path, socket);
        });
      });
    }
  });
};