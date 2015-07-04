var setEmitter = function(emitEvents, socket) {
  var childAdded = function(newChild) {
    socket.broadcast.to(key + '-childadd', newChild);
  };
  var childRemoved = function(removedChild) {
      socket.broadcast.to(key + '-childremove', removedChild);
  };
  for (var key in emitEvents) {
    emitEvents[key].child_added.forEach(childAdded);
    emitEvents[key].child_removed.forEach(childRemoved);
    if (emitEvents[key].value) {
      socket.broadcast.to(key + '-value', emitEvents[key].value);
    }
    for (var changedChild in emitEvents[key].child_changed) {
      socket.broadcast.to(key + '-childchange', changedChild);
    }
  }
};

module.exports = setEmitter;