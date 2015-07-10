var bubbleDown = require('./bubbleDown');

var setEmitter = function(emitEvents, io) {
  var childAdded = function(newChild) {
    io.to(path + '-child_added').emit(path + '-child_added' , newChild);
    bubbleDown(newChild, path, 'child_added', io);
    bubbleDown(newChild, path, 'value', io);
  };
  var childRemoved = function(removedChild) {
    // console.log('inside setEmitter: Path :', path, 'childremoved : ', removedChild);
    io.to(path + '-child_removed').emit(path + '-child_removed' , removedChild);
    bubbleDown(removedChild, path, 'child_removed', io);
    bubbleDown(removedChild, path, 'value', io);
      // console.log('emitted child_removed event: ', path + '-child_removed', ' to room: ', path + '-child_removed', ' with data: ', removedChild);
  };
  for (var path in emitEvents) {
    emitEvents[path].child_added.forEach(childAdded);
    emitEvents[path].child_removed.forEach(childRemoved);
    if (emitEvents[path].value !== null) {
      // console.log('emitted value event: ', path + '-value', ' to room: ', path + '-value', ' with data: ', emitEvents[path].value);
      io.to(path + '-value').emit(path + '-value', emitEvents[path].value);
    }
    for (var changedChild in emitEvents[path].child_changed) {
      var changedChildToSend = {};
      changedChildToSend[changedChild] = emitEvents[path].child_changed[changedChild];
      io.to(path + '-child_changed').emit(path + '-child_changed', changedChildToSend);
      // console.log('emitted child_changed event: ', path + '-child_changed', ' to room: ', path + '-child_changed', ' with data: ', changedChildToSend);
    }
  }
};

module.exports = setEmitter;