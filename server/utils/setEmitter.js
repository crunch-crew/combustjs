var setEmitter = function(emitEvents, io) {
  var childAdded = function(newChild) {
    io.to(path + '-child_added').emit(path + '-child_added' , newChild);
    console.log('emitted child_added event: ', path + '-child_added', ' to room: ', path + '-child_added', ' with data: ', newChild);
  };
  var childRemoved = function(removedChild) {
      io.to(path + '-child_removed').emit(path + '-child_removed' , removedChild);
      console.log('emitted child_removed event: ', path + '-child_removed', ' to room: ', path + '-child_removed', ' with data: ', removedChild);
  };
  for (var path in emitEvents) {
    emitEvents[path].child_added.forEach(childAdded);
    emitEvents[path].child_removed.forEach(childRemoved);
    if (emitEvents[path].value !== null) {
      console.log('emitted value event: ', path + '-value', ' to room: ', path + '-value', ' with data: ', emitEvents[path].value);
      io.to(path + '-value').emit(path + '-value', emitEvents[path].value);
    }
    for (var changedChild in emitEvents[path].child_changed) {
      var changedChildToSend = {};
      changedChildToSend[changedChild] = emitEvents[path].child_changed[changedChild];
      io.to(path + '-child_changed').emit(path + '-child_changed', changedChildToSend);
      console.log('emitted child_changed event: ', path + '-child_changed', ' to room: ', path + '-child_changed', ' with data: ', changedChildToSend);
    }
  }
};

module.exports = setEmitter;