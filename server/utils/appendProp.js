var appendProp = function(path, prop) {
  var newPath;
  if (path === null) {
    return null;
  }
  if(prop) {
    newPath = path + prop + '/';
  }

  return newPath;
};

module.exports = appendProp;