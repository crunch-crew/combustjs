apiToPath = function(url) {
  var path = url.slice(4);
  if (path[path.length-1] !== '/') {
    path += '/';
  }
  return path;
}

module.exports = apiToPath;