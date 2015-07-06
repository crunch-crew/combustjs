var getQuery = require('../rethinkQuery/getQuery');
var getParent = require('./getParent');
var isolateData = require('./isolateData');
//emits to all parents of current path AND current path. 
var bubbleUp = function(event, path, io, inputData) {
  var parentPath;
  var rootObject;
  var data;

  var recurse = function(event, path) {
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
        recurse('child_changed', parentPath);
      }
    }

    //if the event is 'child_changed'
    if(event === 'child_changed') {
      // socket.emit(path + '-child_changed', inputData);
      io.to(path + '-child_changed').emit(path + '-child_changed', inputData);
      parentPath = getParent(path);
      if(parentPath) {
        recurse('child_changed', parentPath);
      }
    }

    //if the event is 'child_removed'
    if(event === 'child_removed') {
      // socket.emit(path + '-child_removed', inputData);
      io.to(path + '-child_removed').emit(path + '-child_removed', inputData);
      parentPath = getParent(path);
      if(parentPath) {
        recurse('child_changed', parentPath);
      }
    }

    //if the event is 'child_moved'
    // if(event === 'child_moved') {

    // }
  };

  getQuery('/', function(parsedObj) {
    rootObject = parsedObj;
    parentPath = getParent(path);
    //if event is value or child_added, emit event at current path, otherwise start at parent
    if (event !== 'value' & event !== 'child_added' && parentPath) {
      recurse(event, parentPath);
    }
    //if even is child-related, emit event at parent path
    else {
      recurse(event, path);
    }
  });
};

module.exports = bubbleUp;

