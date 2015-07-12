

var isolateData = function(path, rootObject) {

  console.log(" in isolateData - path : ", path);

  var pathArray = [];
  var currentPointer = rootObject;

  if(path === '/') {
    return rootObject;
  }

  pathArray = path.split('/');
  pathArray = pathArray.slice(1, pathArray.length - 1);

  console.log(" in isolateData - pathArray   : ", pathArray);

  for(var i = 0; i < pathArray.length; i++) {
    if (currentPointer) {
      currentPointer = currentPointer[pathArray[i]];
  
  console.log(" in isolateData - I is    : ", i);
  console.log(" in isolateData - currentPointer in for   : ", currentPointer);

    }
  }

  console.log(" in isolateData - currentPointer to FINAL RETURN   : ", currentPointer);

  return currentPointer;
};

module.exports = isolateData;