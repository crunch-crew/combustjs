var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var bubbleUp = require('../utils/bubbleUp');
var setDifference = require('../utils/setDifference');
var getQuery = require('../rethinkQuery/getQuery');
var bulkDeleteQuery = require('../rethinkQuery/bulkDeleteQuery');
var deleteQuery = require('../rethinkQuery/deleteQuery');
var deleteAllQuery = require('../rethinkQuery/deleteAllQuery');
var updateByFilterQuery = require('../rethinkQuery/updateByFilterQuery');
var insertQuery = require('../rethinkQuery/insertQuery');
var config = require('../config');
var getParent = require('../utils/getParent');
var deleteQuery = require('../utils/deleteLogic');
var setEmitter = require('../utils/setEmitter');

exports.setup = function(socket, io) {
  /**
   *@apiGroup set
   *@apiName set
   *@api {socket} Sets a javascript object at the specified url
   *@api {socket} Emits back a [url]-setSuccess signal on success
   *@api {socket} Emits value signal to all parents AND the specified url
   *
   *@apiParam {Object} setRequest An object that contains path, _id, and data as properties
   *@apiParam {String} setRequest._id A string that specifies the key of the javascript object
   *@apiParam {String} setRequest.path A string that specifies which path to add the javascript object as a child of
   *@apiParam {Object} setRequest.data A javascript object to add as a child at the specified path
   *
   *
   */
  socket.on('set', function(setRequest) {
    // preprocessing here
    //handles edge case when accessing root path
    var urlArray;
    var _idFind;
    var rootString;
    var incompletePath = false;
    var neededParents = [];

    //TODO: Function that queries for paths only, doesn't return entire db
    getQuery('/', function(rootObject) {
      if (setRequest.path === '/') {
        rootString = null;
        _idFind = "/";
        childrenString = '/';
        children_idFind = "";
      }
      //all other paths - this is just string processing to get it into the proper format for querying the db
      else {
        urlArray = setRequest.path.split('/');
        //urlArray will look something like [users, messages, comments]
        urlArray = urlArray.slice(1, urlArray.length - 1);

        if (!rootObject) {
          neededParents.push('/');
        }

        var dbPointer = rootObject;
        for (var i = 0; i < urlArray.length; i++) {
          //iterates through urlArray and checks to see if the properties in urlArray exist in our current database.
          if (!dbPointer[urlArray[i]]) {
            //keeps track of a variable called "incompletePath" that we will use later. Also pushes the props we need to create
            incompletePath = true;
            neededParents.push(urlArray[i]);
          } else {
            dbPointer = dbPointer[urlArray[i]];
          }
        }
        //sets the rootString which is the path we will use in dbqueries
        rootString = (urlArray.slice(0, urlArray.length - 1 - neededParents.length).join("/")) + "/";
        _idFind = urlArray[urlArray.length - 1];
        childrenString = rootString;
        children_idFind = urlArray[urlArray.length - 1];
      }

      if (!incompletePath) {
        setDifference(setRequest.path, setRequest.data, function(diff) {
          var addRows = [];
          var changeRows = [];
          var id;
          var parentPath;
          var addProps = {};
          var changeProps = {};

          var addAllProps = function() {
            diff.addProps.forEach(function(prop) {
              if (typeof prop[1] !== 'object') {
                var temp = prop[0].split('/');
                parentPath = setRequest.path + temp.slice(1, temp.length - 2).join('/');
                if (parentPath[parentPath.length - 1] !== '/') {
                  parentPath += '/';
                }
                id = temp.slice(temp.length - 2, temp.length - 1)[0];
                //formatting parameters to pass to parseToRows
                var pathRows;
                var idRows;
                var newStaticProperty = {};
                if (parentPath !== '/') {
                  pathRows = getParent(parentPath);
                  idRows = getParent(parentPath);
                  idRows = idRows.split('/');
                  idRows = idRows[idRows.length - 2];


                  newStaticProperty[id] = prop[1];
                  if (!addProps[pathRows]) {
                    addProps[pathRows] = {};
                  }
                } else {
                  pathRows = null;
                  idRows = '/';
                  newStaticProperty[id] = prop[1];
                }

                var parentPathArray = parentPath.split('/');
                propName = parentPathArray[parentPathArray.length - 2];
                if (parentPath !== '/') {
                  addProps[pathRows][propName] = newStaticProperty;
                } else {
                  if (!addProps[propName]) {
                    addProps[propName] = {
                      '/': newStaticProperty
                    };
                  } else {
                    addProps[propName]['/'][id] = newStaticProperty[id];
                  }
                }

              } else {
                var temp2 = prop[0].split('/');
                parentPath = setRequest.path + temp2.slice(1, temp2.length - 2).join('/');
                if (parentPath[parentPath.length - 1] !== '/') {
                  parentPath += '/';
                }
                id = temp2.slice(temp2.length - 2, temp2.length - 1)[0];
                if (!addProps[parentPath]) {
                  addProps[parentPath] = {};
                }
                addProps[parentPath][id] = prop[1];
              }
            });

            var addPropsKeys = Object.keys(addProps);
            addPropsKeys.forEach(function(key) {
              var row;
              var rowId = Object.keys(addProps[key]);
              rowId.forEach(function(rowKey) {
                idRows = key.split('/');
                idRows = idRows[idRows.length - 2];
                row = parseToRows(addProps[key][rowKey], key, rowKey);
                addRows = addRows.concat(row);
              });
            });

            insertQuery(addRows, function(result) {
              var updateId;
              diff.changeProps.forEach(function(prop) {
                if (typeof prop[1] !== 'object') {
                  var temp = prop[0].split('/');
                  parentPath = setRequest.path + temp.slice(1, temp.length - 2).join('/');
                  if (parentPath[parentPath.length - 1] !== '/') {
                    parentPath += '/';
                  }

                  id = temp.slice(temp.length - 2, temp.length - 1)[0];

                  if (!changeProps[parentPath]) {
                    changeProps[parentPath] = {};
                  }
                  changeProps[parentPath][id] = prop[1];

                  updateId = _idFind;
                } else {
                  var temp2 = prop[0].split('/');
                  parentPath = setRequest.path + temp2.slice(1, temp2.length - 2).join('/');
                  if (parentPath[parentPath.length - 1] !== '/') {
                    parentPath += '/';
                  }
                  id = temp2.slice(temp2.length - 2, temp2.length - 1)[0];
                  if (!changeProps[parentPath]) {
                    changeProps[parentPath] = {};
                  }
                  changeProps[parentPath][id] = prop[1];
                }
              });

              var changePropsKeys = Object.keys(changeProps);
              changePropsKeys.forEach(function(key) {
                var row;
                if (key === '/') {
                  row = parseToRows(changeProps[key], null, key);
                  changeRows = changeRows.concat(row);
                } else {
                  var rowId = Object.keys(changeProps[key]);
                  rowId.forEach(function(rowKey) {
                    var rowPath = getParent(key);
                    var rowId = key.split('/');
                    rowId = rowId[rowId.length - 2];
                    row = parseToRows(changeProps[key], rowPath, rowId);
                    changeRows = changeRows.concat(row);
                  });
                }
              });
              var counter = 0;
              var update = function() {
                updateByFilterQuery({
                  path: changeRows[counter].path,
                  _id: changeRows[counter]._id
                }, changeRows[counter], function(result) {
                  counter++;
                  if (counter === changeRows.length) {
                    socket.emit(setRequest.path + '-setSuccess', 'Successfullyl set data');
                    bubbleUp('value', setRequest.path, socket);
                    setEmitter(diff.emitEvents, socket);
                  } else {
                    update();
                  }
                });
              };
              if (changeRows.length === 0) {
                socket.emit(setRequest.path + '-setSuccess', 'Successfullyl set data');
                bubbleUp('value', setRequest.path, socket);
                setEmitter(diff.emitEvents, socket);
              } else {
                update();
              }
            });
          };
          if (diff.deleteProps.length > 0) {
            diff.deleteProps.forEach(function(deleteProp) {
              pathToDelete = setRequest.path.slice(0, setRequest.path.length - 1) + deleteProp;
              deleteQuery(pathToDelete, function() {
                addAllProps();
              });
            });
          } else {
            addAllProps();
          }


        });
      } else {
        var buildObj = {};
        //currentPoint will deeper and deeper into our buildObj as we start building all the missing path to our target path
        var currentPointer = buildObj;
        //iterates through the parents we need to build
        for (var j = 1; j < neededParents.length - 1; j++) {
          currentPointer = currentPointer[neededParents[j]] = {};
        }
        //finally after we have built all the parents sets our path id as a property in the parent row

        currentPointer[_idFind] = setRequest.data;
        //we parse the whole obj that we are building into rows so it can be inserted into db
        //ie. if we were setting an object at /users/message/ and users doesn't exist,
        //buildObj would equal {message: sldfksdlf}
        //rootString would be '/'
        //neededParents[0] would be the _id which is 'users'
        var objToParse;
        if (neededParents.length > 1) {
          objToParse = buildObj;
        } else {
          objToParse = setRequest.data;
        }
        var rows = parseToRows(objToParse, getParent(neededParents[0]), neededParents[0]);
        insertQuery(rows, function(result) {
          socket.emit(setRequest.path + '-setSuccess', {
            success: true
          });
          bubbleUp('value', setRequest.path, socket);
        });
      }
    });
  });
};