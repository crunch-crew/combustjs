var appendProp = require('./appendProp');
var getParent = require('./getParent');
var emitEvent = require('./emitEvent');

var bubbleDown = function(obj, path, event, io) {
  var recurse = function(obj, path, depth) {
    var currentPath;
    depth = depth ? depth : 0;
    for (var key in obj) {
      // test case for arrays no idea if it works yet
      // if (Array.isArray(obj[key])) {
      //   currentPath = appendProp(path, key);
      //   emitEvent(currentPath, event, obj[key], io, depth);
      //   for(var i = 0; i < obj[key].length; i++) {
      //     currentPath = appendProp(currentPath, i);
      //     emitEvent(currentPath, event, obj[key][i], io, depth);
      //     if(obj[key][i] === 'object') {
      //       recurse(obj[key[i]], currentPath, depth + 1);
      //     }
      //     currentPath = getParent(currentPath);
      //   }
      // }
      //checks if the value at the property is a object, calls emitEvent on the event type and path then recurses deeper
      if(typeof obj[key] === "object") {
        currentPath = appendProp(path, key);
        if(event === 'value') {
          emitEvent(currentPath, event, obj[key], io, depth);
        }
        else {
          emitEvent(currentPath, event, obj, io, depth);
        }
        recurse(obj[key], currentPath, depth + 1);
      }
      //else, it is a static property and it will call emitEvent on the path
      else {
        if(event === 'value') {
          currentPath = appendProp(path, key);
          emitEvent(currentPath, event, obj[key], io, depth);
        }
        else {
          currentPath = appendProp(path, key);
          emitEvent(currentPath, event, obj, io, depth);
        }
      }
    }
  };

  recurse(obj ,path);
};

module.exports = bubbleDown;