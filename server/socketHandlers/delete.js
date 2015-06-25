var db = require('../db');
var r = require('rethinkdb');
var emitToParent = require('../utils/emitToParent');
var config = require('../config');

exports.setup = function(socket, io) {
  socket.on('delete', function(deleteRequest) {
    console.log('DELETE REQUEST', deleteRequest);
    var urlArray,
        _idFind,
        rootString,
        parent;

    if (deleteRequest.path === '/') {
      rootString = null; 
      _idFind = '/';
    } else {
      urlArray = deleteRequest.path.split('/');
      urlArray.slice(1, urlArray.length - 1);
      // console.log(urlArray, 'URL ARRAY');
      rootString = (urlArray.slice(0, urlArray.length - 1).join('/')) + '/';
      _idFind = urlArray[urlArray.length - 2];
      parent = urlArray[urlArray.length - 3];
      var key = Object.keys(deleteRequest.data).slice(0, 1).join('');
      // console.log(key);
      // // console.log('PARENT', parent);
      // // console.log('ROOTSTRING', rootString);
      // // console.log('_idFind:', _idFind);
      // console.log('DATA', deleteRequest.data);
      db.connect(function(conn) {
        r.db(config.dbName).table(config.tableName).filter({path: null, _id: parent}).delete().run(conn, function(err, results) {
          if (err) throw err;
          r.db(config.dbName).table(config.tableName).replace(r.row(parent).without(key)).run(conn, function(err, results) {
            if (err) throw err;
            socket.emit(deleteRequest.path + '-deleteSuccess', 'Data was deleted from database!');
          });
        });
      });
    }
  });
};

//[ path: /  id: null]