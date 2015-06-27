var db = require('../db');
var r = require('rethinkdb');
var emitToParent = require('../utils/emitToParent');
var config = require('../config');

exports.setup = function(socket, io) {
  /**
  *@apiGroup delete
  *@apiName delete
  *@api {socket} Deletes a javascript object at the specified url
  *@api {socket} Emits back a [url]-deleteSuccess signal on success
  *@api {socket} Emits value signal to all parents AND the specified url
  *
  *@apiParam {Object} deleteSuccess An object that contains path, _id, and data as properties
  *@apiParam {String} deleteSuccess._id A string that specifies the key of the javascript object
  *
  *
  */

  socket.on('delete', function(deleteRequest) {
    console.log('DELETE REQUEST', deleteRequest.path);
    var urlArray,
        _idFind,
        rootString,
        parent;

    if (deleteRequest.path === '/') {
      rootString = null;
      _idFind = "/";
    } else { 
    var props = Object.keys(deleteRequest.data);
    urlArray = deleteRequest.path.split('/');
    rootString = (urlArray.slice(0, urlArray.length - 1).join('/')) + '/';
    _idFind = urlArray[urlArray.length - 2] || '/';
    parent = urlArray[urlArray.length - 2] || '/';  
    }

    db.connect(function(conn) {
      r.db(config.dbName).table(config.tableName).filter({path: '/messages/', _id: props[0]}).delete().run(conn, function(err, results) {
        if (err) throw err;
        socket.emit(deleteRequest.path + '-deleteSuccess', 'Data successfully deleted!');
        emitToParent('value', deleteRequest.path, socket);
      });
    }); 
  });
};


