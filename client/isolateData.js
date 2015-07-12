/* test-code */
/* end-test-code */
var isolateData = function(path, rootObject) {

  var pathArray = [];
  var currentPointer = rootObject;

  if(path === '/') {
    return rootObject;
  }

  pathArray = path.split('/');
  pathArray = pathArray.slice(1, pathArray.length - 1);

  for(var i = 0; i < pathArray.length; i++) {
    if (currentPointer) {
      currentPointer = currentPointer[pathArray[i]];
    }
  }

  return currentPointer;
};

module.exports = isolateData;