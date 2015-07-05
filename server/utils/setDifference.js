var getQuery = require('../rethinkQuery/getQuery');
//function that gets a pointer to a location in an object based on a url/path
var isolateData = require('./isolateData');
//gets the path/url that is the parent of the passed parameter - string manipulation only
var getParent = require('./getParent');

//creates the data structure which keeps track of which events need to be emitted at each indivdual path
var initializeParentPaths = function(emitEvents, path, prop) {
  var initializePath = function() {
    return {
      child_added: [],
      child_removed: [],
      child_changed: {},
      value: null
    };
  };

  if (path === '/') {
    if (!emitEvents['/']) {
      emitEvents['/'] = initializePath();
    }
    if (!emitEvents[path + prop + '/'] && prop) {
      emitEvents[path + prop + '/'] = initializePath();
    }
    return;
  }

  if (!emitEvents[path+prop+'/']) {
    emitEvents[path+prop+'/'] = initializePath();
    var parent = getParent(path + prop + '/');
    while(parent) {
      if (!emitEvents[parent]) {
        emitEvents[parent] = initializePath();
      }
      parent = getParent(parent);
    }
  }
};

/*creates an array of objects that need to be added to the database, that needed to be changed in the database,
 and that need to be removed from the database. Also creates a data structure for each path (all contained in emitEvents)
 that specifies which events need to be emitted for each path*/

var setDifference = function(setPath, inputObject, callback) {
  // things to add to the database
  var addProps = [];
  //things to change in the database
  var changeProps = [];
  //things to delete from the database
  var deleteProps = [];
  //events to emit at each path
  var emitEvents = {};
  //saves the path we are setting to so we can query the database, then sets it to '/' so we can do the check
  var originalPath = setPath;
  setPath = '/';

  //get object that represents current state of database
  getQuery(originalPath, function(databaseObj) {
    // console.log('in setDifference, existing is: ', databaseObj);
    // console.log('in set difference, databaseObj: ', databaseObj);
    // console.log(originalPath);
    
    /*compare the object that the user is trying to set with the object that already exists in the database
    This function is very similar to a deep equals function, however, in addition to keeping track of adds,
    changes, and delete, it calls the bubbleUp function which will determine which events to trigger on the parents
    of the current path based on the change that is happening at that path*/
    var compareObjects = function(path, newObject, oldObject) {
      var inputData;
      for(var prop in newObject) {
        if(newObject[prop] === null || newObject[prop] === undefined) {
          initializeParentPaths(emitEvents, path, prop);
          inputData = {};
          inputData[prop] = oldObject[prop];
          bubbleUp(emitEvents, 'value', path + prop + '/', inputObject, newObject[prop]);
          bubbleUp(emitEvents, 'child_removed', path + prop + '/', inputObject, inputData);
          deleteProps.push(path + prop + '/');
        }
        else if(oldObject[prop] === undefined) {
          inputData = {};
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
          inputData = {};
          inputData[prop] = oldObject[prop];
          initializeParentPaths(emitEvents, path, prop);
          bubbleUp(emitEvents, 'value', path + prop + '/', inputObject, newObject[prop]);
          bubbleUp(emitEvents, 'child_removed', path + prop + '/', inputObject, inputData);
          deleteProps.push(path + prop + '/');
        }
      } 
    };
    //call the compare function
    compareObjects(setPath, inputObject, databaseObj);
    //execute the callback with all the differences and events to emit in an object
    callback({
      addProps: addProps,
      changeProps: changeProps,
      deleteProps: deleteProps,
      emitEvents: emitEvents
    });
  });
};

//determines which events to trigger on the parents of the passed path based on the event type that is happening at that location
var bubbleUp = function(emitEvents, event, path, rootObject , inputData) {
  var parentPath;
  var data;

  var recurse = function(event, path, inputData) {
    if(event === 'value') {
        // console.log("path is: ", path);
        // console.log("rootObject is: ", rootObject);
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
        parentPath = getParent(path);
        emitEvents[parentPath][event].push(inputData);
        if (parentPath) {
          recurse('child_changed', parentPath, isolateData(parentPath, rootObject));
        }
      }
    }
    var key;
    if(event === 'child_changed') {
      if(path) {
          parentPath = getParent(path);
          if (parentPath) {
              key = path.split('/');
              key = key[key.length-2];
            emitEvents[parentPath][event][key] = inputData;
            recurse('child_changed', parentPath, isolateData(parentPath, rootObject));
          }
      }
    }
    if(event === 'child_removed') {
      if(path) {
        if (path !== '/' && path !== null) {
          parentPath = getParent(path);
          key = path.split('/');
          key = key[key.length-2];
          emitEvents[parentPath][event].push(inputData);
          recurse('child_changed', parentPath, isolateData(parentPath, rootObject));
        }
      }
    }
  };
  recurse(event, path, inputData);
};

module.exports = setDifference;