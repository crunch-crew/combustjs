var getQuery = require('../rethinkQuery/getQuery');
var getParent = require('./getParent');
var isolateData = require('./isolateData');
//emits to all parents of current path AND current path. 
var bubbleUp = function(event, path, socket, inputData) {
  var parentPath;
  var rootObject;
  var data;

  var recurse = function(event, path) {
    //if the event is 'value', will query the db for the new data for every parent path.
    if(event === 'value') {
        //gets the parent path of the current path
        parentPath = getParent(path);
        //returns the obj data associated with the current path
        data = isolateData(path, rootObject);
        socket.emit(path + '-' + event, data);
        if (parentPath) {
          recurse('value', parentPath);  
        }
    }
    //if the event is 'child_added'
    if(event === 'child_added') {
      parentPath = getParent(path);
      if(parentPath) {
        socket.emit(parentPath + '-child_added', inputdata);
        recurse('child_changed', parentPath);
      }
    }

    //if the event is 'child_changed'
    if(event === 'child_changed') {
      parentPath = getParent(path);
      if(parentPath) {
        socket.emit(parentPath + '-child_changed', data);
        recurse('child_changed', parentPath);
      }
    }

    //if the event is 'child_removed'
    if(event === 'child_removed') {
      parentPath = getParent(path);
      if(parentPath) {
        socket.emit(parentPath + '-child_removed', inputData);
        recurse('child_changed', parentPath);
      }
    }

    //if the event is 'child_moved'
    // if(event === 'child_moved') {

    // }
  };

  getQuery('/', function(parsedObj) {
    rootObject = parsedObj;
    recurse(event, path);
  });
};

module.exports = bubbleUp;

