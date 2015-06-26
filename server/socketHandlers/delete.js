var db = require('../db');
var r = require('rethinkdb');
var emitToParent = require('../utils/emitToParent');
var config = require('../config');

exports.setup = function(socket, io) {
  socket.on('delete', function(deleteRequest) {
    console.log('DELETE REQUEST', deleteRequest.path);
    var urlArray,
        _idFind,
        rootString,
        parent;
    if (deleteRequest.path === '/') {
      // rootString = null; 
      // _idFind = '/';
    } else {
      urlArray = deleteRequest.path.split('/');
      urlArray.slice(1, urlArray.length - 1);
      console.log('urlArray after slice::::', urlArray);
      rootString = (urlArray.slice(0, urlArray.length - 1).join('/')) + '/';
      _idFind = urlArray[urlArray.length - 1];
      parent = urlArray[urlArray.length - 2];
      var key = Object.keys(deleteRequest.data).slice(0, 1).join('');
      db.connect(function(conn) {
        r.db(config.dbName).table(config.tableName).filter({path: rootString, _id: _idFind}).delete().run(conn, function(err, results) {
          console.log('delete to database call was a success');
          if (err) throw err;
          socket.emit(deleteRequest.path + '-deleteSuccess', 'Data successfully deleted!');
          emitToParent('value', deleteRequest.path, socket);
          console.log('Query results from delete socket handler', results);
        });
      });
    }
  });
};
