var getParent = function(path) {
  var parentPath;
  if(path === '/' || path === null) {
    return null;
  }
  parentPath = path.split('/');
  parentPath = parentPath.slice(0, parentPath.length - 2).join('/') + '/';
  return parentPath;
};

module.exports = getParent;