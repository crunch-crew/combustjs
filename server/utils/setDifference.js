var getQuery = require('../rethinkQuery/getQuery');

var setDifference = function(setPath, inputObject, callback) {

  var initializeParentPaths = function(emitEvents, path, prop) {
    var initializePath = function() {
      return {
        child_added: [],
        child_removed: [],
        child_changed: {},
        value: false
      }
    }

    if (path === '/') {
      if (!emitEvents['/']) {
        emitEvents['/'] = initializePath();
        return;
      }
      return;
    }

    if (!emitEvents[path+prop+'/']) {
      emitEvents[path+prop+'/'] = initializePath();
      var parent = getParent(path + prop + '/');
      while(parent) {
        emitEvents[parent] = initializePath();
        parent = getParent(parent);
      }
    }
  }
 //[[path, newObject], [path2, newObject2]]
 var addProps = [];
 //[[path, changedObject], [path2, changedObject2]]
 var changeProps = [];
 //[path, path2, path3]
 var deleteProps = [];
 //store events
 var emitEvents = {
  // path1: {
  //   addChild: [{}], ,
  //   value: {}
  // }
 }

  getQuery(setPath, function(databaseObj) {
    var compareObjects = function(path, newObject, oldObject) {
      for(var prop in newObject) {
        if(newObject[prop] === null || newObject[prop] === undefined) {
          deleteProps.push(path + prop + '/');
        }
        else if(oldObject[prop] === undefined) {
          var inputData = {};
          inputData[prop] = newObject[prop];
          initializeParentPaths(emitEvents, path, prop);
          addProps.push([path + prop + '/', newObject[prop]]);
          bubbleUp(emitEvents, 'child_added', path + prop + '/', inputObject, inputData);
          // emitEvents[path+prop+'/'].child_added.push(newObject[prop]);
        }
        // else if(newObject[prop] !== oldObject[prop] && typeof newObject[prop] !== 'object') {
        //   changeProps.push([path + prop + '/', newObject[prop]]);
        // }
        else if((newObject[prop] !== oldObject[prop] && typeof oldObject[prop] !== 'object') ||
          (newObject[prop] !== oldObject[prop] && typeof newObject[prop] !== 'object')) {
          // if (typeof newObject[prop] !== object) {
          //   var inputData = {};
          //   inputData[prop] = newObject[prop];

          // }
          // var inputData = newObject;
          // inputData = newObject;
          // console.log('input data is: ', inputData);
          initializeParentPaths(emitEvents, path, prop);
          // console.log(emitEvents);
          changeProps.push([path + prop + '/', newObject[prop]]);
          bubbleUp(emitEvents, 'child_changed', path + prop + '/', inputObject, newObject[prop]);
          // console.log('after bubble up: ', emitEvents['/'].child_changed);
        }
        else if(typeof newObject[prop] === 'object' && typeof oldObject[prop] === 'object') {
          compareObjects(path + prop + '/', newObject[prop], oldObject[prop]);
        }
      }
      for(prop in oldObject) {
        if(!(prop in newObject)) {
          deleteProps.push(path + prop + '/');
        }
      } 
    };
    compareObjects(setPath, inputObject, databaseObj);
    callback({
      addProps: addProps,
      changeProps: changeProps,
      deleteProps: deleteProps,
      emitEvents: emitEvents
    });
  });
};

var isolateData = require('./isolateData');
var getParent = require('./getParent');
var bubbleUp = function(emitEvents, event, path, rootObject , inputData) {
  var parentPath;
  var rootObject;
  var data;

  var recurse = function(event, path, inputData) {
    //if the event is 'value', will query the db for the new data for every parent path.
    if(event === 'value') {
        //gets the parent path of the current path
        parentPath = getParent(path);
        //returns the obj data associated with the current path
        data = isolateData(path, rootObject);
        // socket.emit(path + '-' + event, data);
        emitEvents[path][event] = true;
        if (parentPath) {
          recurse('value', parentPath);  
        }
    }
    //if the event is 'child_added'
    if(event === 'child_added') {
      if(path) {
        parentPath = getParent(path);
        // socket.emit(parentPath + '-child_added', inputdata);
        emitEvents[parentPath][event].push(inputData);
        // parentOfParentPath = getParent(parentPath);
        if (parentPath) {
          recurse('child_changed', parentPath);
        }
      }
    }

    //if the event is 'child_changed'
    if(event === 'child_changed') {
      if(path) {
        if (path !== '/' && path !== null) {
          parentPath = getParent(path);
          var key = path.split('/');
          key = key[key.length-2];
      // console.log("inside child_changed, parentpath is: ", parentPath);
      // console.log("inside child_changed, key is: ", key);
      // console.log("input data is: ", inputData);
          // console.log("parentpath is: ", parentPath);
          // console.log("key is: ", key);
          //get last part of path
          // console.log("before set, emit to events looks like: ", emitEvents[parentPath][event]);
          emitEvents[parentPath][event][key] = inputData;
          // console.log("emit to events now looks like: ", emitEvents[parentPath][event]);
          // console.log("emitevents path: ", emitEvents[parentPath][event][key]);

          // console.log("path is: " + path + " key is: ", key);
          recurse('child_changed', parentPath, isolateData(parentPath, rootObject));
          // recurse('value', parentPath);
        }
      }
    }

    //if the event is 'child_removed'
    if(event === 'child_removed') {
      parentPath = getParent(path);
      if(parentPath) {
        // socket.emit(parentPath + '-child_removed', inputData);
        emitEvents[parentPath][event].push(inputData);
        parentOfParentPath = getParent(parentPath);
        recurse('child_changed', parentOfParentPath);
      }
    }

  };
    recurse(event, path, inputData);
};

module.exports = setDifference;
