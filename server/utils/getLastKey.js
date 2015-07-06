var getLastKey = function(path) {
  if (path === '/') {
    return '/';
  }

  if (path === null) {
    return null;
  }

  var pathArray = path.split('/');

  return pathArray[pathArray.length-2];
};

module.exports = getLastKey;