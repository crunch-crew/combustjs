var dbQuery = require('../utils/dbQuery');
var setDifference = function(setPath, inputObject, callback) {
 //[[path, newObject], [path2, newObject2]]
 var addProps = [];
 //[[path, changedObject], [path2, changedObject2]]
 var changeProps = [];
 //[path, path2, path3]
 var deleteProps = [];

  dbQuery('get', setPath, function(databaseObj) {
    var compareObjects = function(path, newObject, oldObject) {
      for(var prop in newObject) {
        if(newObject[prop] === null || newObject[prop] === undefined) {
          deleteProps.push(path + prop + '/');
        }
        else if(oldObject[prop] === undefined) {
          addProps.push([path + prop + '/', newObject[prop]]);
        }
        else if(newObject[prop] !== oldObject[prop] && typeof newObject[prop] !== 'object') {
          changeProps.push([path + prop + '/', newObject[prop]]);
        }
        else if(newObject[prop] !== oldObject[prop] && typeof oldObject[prop] !== 'object') {
          changeProps.push([path + prop + '/', newObject[prop]]);
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
      deleteProps: deleteProps
    });
  });
};

module.exports = setDifference;