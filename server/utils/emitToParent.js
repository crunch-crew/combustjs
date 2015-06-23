//emits to all parents of current path as well as current path.
var emitToParent = function(change, path, socket, data) {
  data = data || null;
  if (path === '/') {
    socket.emit(path + '-' + change, data);
    return;
  }
  socket.emit(path + '-' + change, data);
  var parentUrl = path.split('/')
  parentUrl = parentUrl.slice(0, parentUrl.length-2);
  emitToParent(change, parentUrl.join('/') + '/', socket, data);
};

module.exports = emitToParent;