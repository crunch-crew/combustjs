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

    var props = Object.keys(deleteRequest.data);
    console.log('Key to DELETE from specified path:', props);

    urlArray = deleteRequest.path.split('/');
    rootString = (urlArray.slice(0, urlArray.length - 1).join('/')) + '/'
    console.log('rootString after slice', rootString)

    _idFind = urlArray[urlArray.length - 2] || '/';
    parent = urlArray[urlArray.length - 2] || '/';

    console.log('ROOTSTRING: ', rootString);
    console.log('_IDFIND: ', _idFind);

    db.connect(function(conn) {
      r.db(config.dbName).table(config.tableName).filter({path: '/messages/', _id: props[0]}).delete().run(conn, function(err, results) {
        if (err) throw err;
        socket.emit(deleteRequest.path + '-deleteSuccess', 'Data successfully deleted!');
        emitToParent('value', deleteRequest.path, socket);
      });
    }); 
  });
};


