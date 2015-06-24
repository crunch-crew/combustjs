var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows.js');
var parseToObj = require('../utils/parseToObj.js');
var emitToParent = require('../utils/emitToParent');
var config = require('../config');

exports.setup = function(socket, io) {
  console.log(io);
  socket.on('delete', function(deleteRequest) {
    var urlArray;
    var _idFind;
    var rootString;

    if (deleteRequest.path === '/') {
      rootString = null; 
      _idFind = '/';
    } else {
      urlArray = deleteRequest.path.split('/').slice(urlArray.length - 1);
      console.log('urlArray on line 20 of delete.js', urlArray);
      rootString = (urlArray.slice(0, urlArray.length - 1).join('/')) + '/';
      _idFind = urlArray[urlArray.length - 1];
      db.connect(function(conn) {
        r.db(config.dbName).table(config.tableName).filter({path: rootString, _id: _idFind}).delete().run(conn);
        r.db(config.dbName).table(config.tableName).filter(r.row('path').match(rootString + _idFind + '/*')).delete().run(conn, function(err, results) {
          if (err) throw err;
          socket.emit(deleteRequest.path + '-deleteSuccess', 'Data has successfully been deleted!');
          emitToParent('value', deleteRequest.path + socket);
        });
      });
    }
  });
};