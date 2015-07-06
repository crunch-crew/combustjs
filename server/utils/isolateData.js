//returns the data at the specific path given a root object
var isolateData = function(path, rootObject) {
  var pathArray = [];
  var currentPointer = rootObject;

  if(path === '/') {
    return rootObject;
  }

  // console.log('path inside isolateData:',path);
  // console.log('object inside isolateData:',rootObject);
  pathArray = path.split('/');
  pathArray = pathArray.slice(1, pathArray.length - 1);
  for(var i = 0; i < pathArray.length; i++) {
    // console.log('pathArray:', pathArray);
    // console.log('currentPointer:', currentPointer);
    if(currentPointer) currentPointer = currentPointer[pathArray[i]];
  }
  return currentPointer;
};

module.exports = isolateData;