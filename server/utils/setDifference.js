var getQuery = require('../rethinkQuery/getQuery');

var setDifference = function(setPath, inputObject, callback) {

  var initializeParentPaths = function(emitEvents, path, prop) {
    // console.log("in initializeparentpaths, path is: ", path, " and prop is: ", prop);
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
      }
      if (!emitEvents[path + prop + '/'] && prop) {
        // console.log(path+prop+'/', 'initialized');
        emitEvents[path + prop + '/'] = initializePath();
      }
      return;
    }


    if (!emitEvents[path+prop+'/']) {
      // console.log(path+prop+'/', 'initialized');
      // console.log("created path: ", path + prop + '/');
      emitEvents[path+prop+'/'] = initializePath();
      var parent = getParent(path + prop + '/');
      while(parent) {
        if (!emitEvents[parent]) {
          emitEvents[parent] = initializePath();
        }
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
 var emitEvents = {}

  getQuery(setPath, function(databaseObj) {
    var compareObjects = function(path, newObject, oldObject) {
      for(var prop in newObject) {
        if(newObject[prop] === null || newObject[prop] === undefined) {
          initializeParentPaths(emitEvents, path, prop);
          var inputData = {};
          inputData[prop] = oldObject[prop];
          bubbleUp(emitEvents, 'value', path + prop + '/', inputObject, newObject[prop]);
          bubbleUp(emitEvents, 'child_removed', path + prop + '/', databaseObj, inputData);
          deleteProps.push(path + prop + '/');
        }
        else if(oldObject[prop] === undefined) {
          var inputData = {};
          inputData[prop] = newObject[prop];
          initializeParentPaths(emitEvents, path, prop);
          addProps.push([path + prop + '/', newObject[prop]]);
          bubbleUp(emitEvents, 'child_added', path + prop + '/', inputObject, inputData);
          bubbleUp(emitEvents, 'value', path + prop + '/', inputObject, newObject[prop]);
        }
        else if((newObject[prop] !== oldObject[prop] && typeof oldObject[prop] !== 'object') ||
          (newObject[prop] !== oldObject[prop] && typeof newObject[prop] !== 'object')) {
          initializeParentPaths(emitEvents, path, prop);
          changeProps.push([path + prop + '/', newObject[prop]]);
          bubbleUp(emitEvents, 'child_changed', path + prop + '/', inputObject, newObject[prop]);
          bubbleUp(emitEvents, 'value', path + prop + '/', inputObject, newObject[prop]);
        }
        else if(typeof newObject[prop] === 'object' && typeof oldObject[prop] === 'object') {
          compareObjects(path + prop + '/', newObject[prop], oldObject[prop]);
        }
      }
      for(prop in oldObject) {
        if(!(prop in newObject)) {
          var inputData = {};
          inputData = oldObject;
          initializeParentPaths(emitEvents, path, prop);
          bubbleUp(emitEvents, 'value', path + prop + '/', inputObject, newObject[prop]);
          bubbleUp(emitEvents, 'child_removed', path + prop + '/', databaseObj, inputData);
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
        data = isolateData(path, rootObject);
        if (data === undefined) {
          data = null;
        }
        emitEvents[path][event] = data;
        parentPath = getParent(path);
        if (parentPath) {
          recurse('value', parentPath);  
        }
    }
    if(event === 'child_added') {
      if(path) {
        // recurse('value', path);
        // console.log("path is: ", path);
        // console.log("object is: ", emitEvents);
        // emitEvents[path].value = isolateData(path,rootObject);
        parentPath = getParent(path);
        emitEvents[parentPath][event].push(inputData);
        if (parentPath) {
          recurse('child_changed', parentPath, isolateData(parentPath, rootObject));
        }
      }
    }
    if(event === 'child_changed') {
      if(path) {
          parentPath = getParent(path);
          if (parentPath) {
            // if (parentPath === '/') {
            //   key = path.replace('/', '');
            // }
            // else {
              var key = path.split('/');
              key = key[key.length-2];
            // }
            emitEvents[parentPath][event][key] = inputData;
            recurse('child_changed', parentPath, isolateData(parentPath, rootObject));
          }
      }
    }
    if(event === 'child_removed') {
      if(path) {
        if (path !== '/' && path !== null) {
          parentPath = getParent(path);
          var key = path.split('/');
          key = key[key.length-2];
          var removedChild = {};
          removedChild[key] = isolateData(path,rootObject);
          emitEvents[parentPath][event].push(removedChild);
          recurse('child_changed', parentPath, isolateData(parentPath, rootObject));
        }
      }
    }
  };
    recurse(event, path, inputData);
};

module.exports = setDifference;
