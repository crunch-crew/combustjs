var getParent = require('./getParent');
var getLastKey = require('./getLastKey');

var emitEvent = function(path, event, data, io, depth) {
  var parentPath;
  //if the event is value it will emit at the path with the data provided
  if(event === 'value') {
    io.to(path + '-value').emit(path + '-value', data);
  }
  //if the event is child_added it will emit at the parent path notifying that a child is added with the data
  if(event === 'child_added') {
    parentPath = getParent(path);
    if(parentPath) {
      io.to(parentPath + '-child_added').emit(parentPath + '-child_added', data);
    }
  }
  //if the event is child_removed it will emit at the parentPath notifying that a child is removed however, 
  //due to overlapping of bubbleup and bubbledown we will only emit if the depth of the bubble down is 1 or greater
  if(event === 'child_removed') {
    parentPath = getParent(path);
    if(parentPath) {
      if(depth > 0) {
      io.to(parentPath + '-child_removed').emit(parentPath + '-child_removed', data);
      }
    }
  }
};

module.exports = emitEvent;