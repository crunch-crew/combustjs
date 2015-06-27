var dbQuery = require('./dbQuery');
//emits to all parents of current path AND current path. 
var emitToParent = function(event, path, socket, data) {
  //sets data to null if no data was given
  data = data || null;
  //if the event is 'value', will query the db for the new data for every parent path.
  if(event === 'value') {
    dbQuery('get', path, function(parsedObj) {
      data = parsedObj;
      //at absolute root path emits event and returns out of function
      if (path === '/') {
        socket.emit(path + '-' + event, data);
        return;
      }
      //not root so it emits the event and then calls emitToParent with the the closest parent route
      socket.emit(path + '-' + event, data);
      var parentUrl = path.split('/');
      parentUrl = parentUrl.slice(0, parentUrl.length-2);
      emitToParent(event, parentUrl.join('/') + '/', socket, data);  
    });
  }
  
  //if the event is 'child_added'
  if(event === 'child_added') {
    // this should be invoked on parent by the child at the time of event on itself
    // a 'child_added', 'child_changed', 'child_removed' event here should bubble up to parent resulting in triggering 'child_changed' and 'value' events on appropriate parents in the chain
    emitToParent('value', path, socket, data); // emit value here and bubble up
    // invoke_child changed on parents of this

  }

  //if the event is 'child_changed'
  if(event === 'child_changed') {
    console.log('child changed - in emitToParent - to be completed')
    // this should be invoked on parent by the child at the time of event on itself
    // a 'child_added', 'child_changed', 'child_removed' event here should bubble up to parent resulting in triggering 'child_changed' and 'value' events on appropriate parents in the chain
    emitToParent('value', path, socket, data); // emit value here and bubble up
    // invoke_child changed on parents of this
  }

  //if the event is 'child_removed'
  if(event === 'child_removed') {
    // this should be invoked on parent by the child at the time of event on itself
    // a 'child_added', 'child_changed', 'child_removed' event here should bubble up to parent resulting in triggering 'child_changed' and 'value' events on appropriate parents in the chain
    emitToParent('value', path, socket, data); // emit value here and bubble up
    // invoke_child changed on parents of this
  }

  //if the event is 'child_moved'
  if(event === 'child_moved') {
    //placeholder for now
  }

};

module.exports = emitToParent;

// var dbQuery = require('./dbQuery');
// //emits to all parents of current path AND current path. 
// var emitToParent = function(event, path, socket, data, highestUrl) {
//   var childrens, currentPath, currentData;
//   //throws error if no data is given
//   if(!data) {
//     throw 'bad input';
//   }
//   socket.emit(highestUrl + '-' + event, data);

//   currentPath = [];
//   currentData = data;
//   childrens = path.split('/')
//   childrens = childrens.slice(1, childrens.length-1); 
//   for(var i = 0; i < childrens.length; i++) {
//     currentPath.push(childrens[i]);
//     currentData = currentData[childrens[i]];
//     socket.emit('/' + currentPath.join('/') + '/-' + event, currentData);
//   } 
// };

// module.exports = emitToParent;
