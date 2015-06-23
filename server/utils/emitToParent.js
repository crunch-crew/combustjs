var dbQuery = require('./dbQuery');
//emits to all parents of current path AND current path. 
var emitToParent = function(event, path, socket, data) {
  //sets data to null if no data was given
  data = data || null;
  //if the event is 'value', will query the db for the new data for every parent path.
  if(event === 'value') {
    dbQuery('get', {url: path}, function(parsedObj) {
      data = parsedObj;
      //at absolute root path emits event and returns out of function
      if (path === '/') {
        socket.emit(path + '-' + event, data);
        return;
      }
      //not root so it emits the event and then calls emitToParent with the the closest parent route
      socket.emit(path + '-' + event, data);
      var parentUrl = path.split('/')
      parentUrl = parentUrl.slice(0, parentUrl.length-2);
      emitToParent(event, parentUrl.join('/') + '/', socket, data);  
    })
  }
};

module.exports = emitToParent;