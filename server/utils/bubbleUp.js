var getQuery = require('../rethinkQuery/getQuery');
var getParent = require('./getParent');
var isolateData = require('./isolateData');
var getLastKey = require('./getLastKey');
//emits to all parents of current path AND current path. 
var bubbleUp = function(event, path, io, inputData) {
  var rootObject;
  var data;

  var recurse = function(event, path, recursiveCall, childKey) {
    var parentPath;
    //if the event is 'value', will query the db for the new data for every parent path.
    if(event === 'value') {
        //gets the parent path of the current path
        //returns the obj data associated with the current path
        data = isolateData(path, rootObject);
        // socket.emit(path + '-' + event, data);
        io.to(path + '-value').emit(path + '-value', data);
        parentPath = getParent(path);
        if (parentPath) {
          recurse('value', parentPath);  
        }
    }
    //if the event is 'child_added'
    if(event === 'child_added') {
      // socket.emit(path + '-child_added', inputData);
      io.to(path + '-child_added').emit(path + '-child_added', inputData);
      parentPath = getParent(path);
      if(parentPath) {
        recurse('child_changed', parentPath, true, getLastKey(path));
        // io.to(parentPath + '-value').emit(parentPath + -'value', isolateData(parentPath, rootObject));
      }
    }

    //if the event is 'child_changed'
    if(event === 'child_changed') {
      // socket.emit(path + '-child_changed', inputData);
      var payload = {};
      //the recurse parameter is used to determine if the function was called directly or from within itself
      if (recursiveCall) {
        payload[childKey] = isolateData(path, rootObject)[childKey];
      }
      else {
        payload = inputData;
      }
      io.to(path + '-child_changed').emit(path + '-child_changed', payload);
      parentPath = getParent(path);
      if(parentPath) {
        recurse('child_changed', parentPath, true, getLastKey(path));
        // recurse('value', parentPath);
      }
    }

    //if the event is 'child_removed'
    if(event === 'child_removed') {
      // socket.emit(path + '-child_removed', inputData);
      io.to(path + '-child_removed').emit(path + '-child_removed', inputData);
      parentPath = getParent(path);
      if(parentPath) {
        recurse('child_changed', parentPath, true, getLastKey(path));
        // recurse('value', parentPath);
      }
    }

    //if the event is 'child_moved'
    // if(event === 'child_moved') {

    // }
  };
  getQuery('/', function(parsedObj) {
    rootObject = parsedObj;
    var parentPath = getParent(path);
    //if event is value or child_added, emit event at current path, otherwise start at parent
    if ((event === 'child_removed' || event === 'child_changed') && parentPath) {
      recurse(event, parentPath, false);
    }
    //if even is child-related, emit event at parent path
    else if (event === 'child_added' && path) {
      recurse(event, path);
    }
    recurse('value', path);
  });
};

module.exports = bubbleUp;

