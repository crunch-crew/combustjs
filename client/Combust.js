//required for testing only - remove in production
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var io = require('socket.io-client');
var localStorage = require('./specs/utils/localStorage')();

/**
* Combust class always maintains a path to part of the database and has various methods for reading and writing data to it,
* as well as listening for changes in data at the specified path.
*
*@class Combust
*
*@constructor
*/
var Combust = function(options, callback) {
  this.callback = callback || function() {};
  this.auth = options.auth || null;
  this.serverAddress = options.serverAddress || null;
  this.dbName = options.tableName || 'test';
  this.tableName = options.tableName || 'test';
  //checks localStorage to see if token is already stored
  this.token = localStorage.getItem('token') || null;
  
  //manage socket connection
  if (options.socket) {
    this.socket = options.socket;
  }
  else if (this.serverAddress) {
    this.connectSocket(this.callback);
  }
  else {
    this.socket = null;
  }
  this.pathArray = ['/'];
};

//create socket connection to server - internal method, no API documentation
Combust.prototype.connectSocket = function(callback) {
  //if authentication credentials are provided, attempt to get obtain a token from the server and then establish an authenticated websocket connection.
  if (this.auth) {
    this.authenticate(this.auth, function(response) {
      if (response.success) {
        this.socket = io.connect(this.serverAddress, {
          forceNew: true,
          //send the web token with the initial websocket handshake
          query: 'token=' + response.token
        });
        this.token = response.token;
        this.socket.on('connectSuccess', function() {
          callback(response);
        });
      }
      //does not attempt connetion if credentials are invalid.
      else {
        console.log('CombustJS: Invalid credentials. Socket connection not established.');
        callback(response);
      }
    }.bind(this));
  }
  else {
    //if user already has a token from local storage, make an authenticated connection
    if (this.token) {
      this.socket = io.connect(this.serverAddress, {
        forceNew: true,
        //send the web token with the initial websocket handshake
        query: 'token=' + this.token
      });
    }
    //else make an unauthenticated connection
    else {
      this.socket = io.connect(this.serverAddress, {
        forceNew: true
      });
    }
    this.socket.once('connectSuccess', function(response) {
      if (response.success) {
        callback(response);
      }
      else {
        console.log('CombustJS: Connection refused by server');
        callback(response);
      }
    });
    //Handling of servers received from server
    this.socket.once('error', function(err) {
      if (err === 'TokenExpiredError') {
        console.log('CombustJS: Token expired. Please reauthenticate.');
        callback({success: false, error: err});
      }
      else if (err === 'TokenCorruptError') {
        console.log('CombustJS: Token is corrupt');
        callback({success: false, error: err});
      }
      else {
        console.log('CombustJS: Connection refused by server.');
        callback({success: false, error: 'Unknown'});
      }
    });
  }
};

/* this method doesn't have documentation because its an internal method that the user should not use.
   Converts the pathArray variable into a string that can be used by other methods to interact with the server
*/
Combust.prototype.constructPath = function() {
  var path;
  if (this.pathArray[0] === '/' && this.pathArray.length === 1) {
    return '/';
  }
  else if (this.pathArray[0] === '/') {
    path = this.pathArray.slice(1);
  }
  else {
    path = this.pathArray;
  }
  return "/" + path.join('/') + '/';
};

/**
* Change the path of the Combust object to point to one of the children of the current path.
* Method is chainable.
*
*@method child
*
*@param childName {String} childName Name of the child of the current path to point Combust at
*@return {Object} Returns a mutated instance of the same Combust instance so that it can be chained.
*/

//consider changing this method so that it returns a new Combust object instead of mutating the existing one
Combust.prototype.child = function(childName) {
  var newRef = new Combust({
    dbName: this.dbName,
    tableName: this.tableName,
    socket: this.socket
  });
  newRef.token = this.token;
  newRef.pathArray = this.pathArray.slice();
  newRef.pathArray.push(childName);
  return newRef;
};

/**
* Pushes an object as a new child at the current path.
*
*@method push
*
*@param object {Object} object The object to push as a new child at the current path.
*@param *callback {Callback} callback The callback to be executed once the new child has been synchronized with the database. Optional parameter.
*
*@return {Object} Returns a new instance of Combust that points to the path of the newly created child.
*/

/* returns a new object combust reference immediately, but once it receives the new key from the database
it updates the returned combust reference with the proper path */
Combust.prototype.push = function(object, callback) {
  var newRef = new Combust({
    dbName: this.dbName,
    tableName: this.tableName,
    socket: this.socket
  });
  newRef.token = this.token;
  newRef.pathArray = this.pathArray.slice();

  this.socket.once(this.constructPath() + '-pushSuccess', function(data) {
    newRef.pathArray.push(data.key);
    if (callback) {
      callback(data);
    }
  });
  this.socket.emit('push', {path: this.constructPath(), data: object});

  return newRef;
};

/**
* Deletes an object at the current path.
*
*@method delete
* 
*@param object {Object} object The object to delete at the current path.
*@param *callback {Callback} callback The callback to be executed once the object has been deleted at the path in the database. Optional parameter.
*
*/

// Takes in an object to be set at a path and emits an event to the server
Combust.prototype.delete = function(object, callback) {
  //should delete switch path to parent or something?
  var path = this.constructPath();

  this.socket.once(path + '-deleteSuccess', function(data){
    if (callback) {
      callback(data);
    }
  });
  this.socket.emit('delete', {path: path}); 
};

/**
* Sets an object at the current path.
*
*@method set
*
*@param object {Object} object The object to set at the current path.
*@param *callback {Callback} callback The callback to be executed once the object has been set at the path in the database. Optional parameter.
*
**/

/* Takes in an object to be set at path. Does not return anything. */
Combust.prototype.set = function(object, callback) {
  var newRef = new Combust({
    dbName: this.dbName,
    tableName: this.tableName,
    socket: this.socket
  });
  //transfer token
  newRef.token = this.token;

  this.socket.once(this.constructPath() + '-setSuccess', function(data) {
    if (callback) {
      callback(data);
    }
  });
  this.socket.emit('set', {path: this.constructPath(), data: object});
};


/**
* Updates object at the current path.
*
*@method update
*
*@param object {Object} object The object to update the current path with.
*@param *callback {Callback} callback The callback to be executed once the object has been updated at the path in the database. Optional parameter.
*
*/

/* Takes in an object to update existing object at path in database. #### TBD - WHAT to return ###### */
Combust.prototype.update = function(object, callback) {
  var newRef = new Combust({
    dbName: this.dbName,
    tableName: this.tableName,
    socket: this.socket
  });

  this.socket.once(this.constructPath() + '-updateSuccess', function(data) {
    if (callback) {
      callback(data);
    }
  });
  this.socket.emit('update', {path: this.constructPath(), data: object});
};

//TODO: Update this documentation and function
/**
* Creates an event listener for a specified event at the current path.
*
*@method on
*
*@param eventType {String} eventType The type of event to listen for at the current path - currently supported values are "child_added", "child_changed", "child_removed", "value"
*@param *callback {Function} callback(newChild) The callback to be executed once the specified event is triggered. Accepts the new child as the only parameter.
*/
Combust.prototype.on = function(eventType, callback) {
  //set it here incase path changes before getSuccess is executed
  var path = this.constructPath();
  //this binding is lost in async calls so store it here
  var socket = this.socket;
  if (eventType === "child_added") {
    socket.once(path + '-subscribeUrlChildAddedSuccess', function() {
      //need a get children method - not desired functionality as written
      socket.emit('getUrlChildren', {url: path});
    });
    socket.once(path + "-getUrlChildrenSuccess", function(data) {
      //getUrlChildren returns null if path points to a static property
      if (data !== null) {
        //getUrlChildren will return an array of Objects, ie. [{key1: 1}, {key2:{inkey:2}}, {key3: true}]
        data.forEach(function(child) {
          //calls callback on all current children
          callback(child);
        });
      }
      socket.on(path + '-child_added', function(data) {
        //call callback on new child
        callback(data);
      });
    });
    socket.emit("subscribeUrlChildAdded", {url: path});
  }
  //changed this to not retrieve existing children, leave that to child_added
  if (eventType === "child_changed") {
    socket.once(path + '-subscribeUrlChildChangedSuccess', function() {
      // socket.emit('getUrlChildren', {url: path});
      socket.on(path + '-child_changed', function(data) {
        callback(data);
      });
    });
    // socket.once(path + "-getUrlChildrenSuccess", function(data) {
    //   data.forEach(function(child) {
    //     callback(child);
    //   });
    // });
    socket.emit("subscribeUrlChildChanged", {url: path});
  }
  if (eventType === "child_removed") {
    socket.once(path + '-subscribeUrlChildRemovedSuccess', function() {
      // socket.emit('getUrlChildren', {url: path});
      socket.on(path + '-child_removed', function(data) {
        callback(data);
      });
    });
    // socket.once(path + "-getUrlChildrenSuccess", function(data) {
    //   data.forEach(function(child) {
    //     callback(child);
    //   });
    // });
    socket.emit("subscribeUrlChildRemoved", {url: path});
  }
  //changed this to trigger the callback once on whatever value is currently in the db and then listen for changes
  if (eventType === "value") {
    socket.once(path + '-subscribeUrlValueSuccess', function() {
      socket.emit('getUrl', {url: path});
    });
    socket.once(path + "-getUrlSuccess", function(data) {
      // data.forEach(function(child) {
      //   callback(child);
      // });
      callback(data);
      socket.on(path + '-value', function(data) {
        callback(data);
      });
    });
    socket.emit("subscribeUrlValue", {url: path});
  }
};

/**
* Attempts to create a new user
*
*@method newUser
*
*@param newUser {Object} newUser Object that contains the credentials of the user to be added.
*@param newUser.username username Username to associate with new user.
*@param newUser.password password Password to associate with new user.
*@param *callback(response) {Function} callback(response) The callback to be executed once a response from the server is received. Accepts response as the only parameter.
*Response has two properties: 
*1) 'success' which indicates whether the new user was successfully created or not.
*2) 'id' which will contains the new users id if the operation was successful. 
*/
Combust.prototype.newUser = function(newUser, callback) {
  //raw http requests
  var xhr = new XMLHttpRequest();
  xhr.open('POST', encodeURI('http://0.0.0.0:3000/signup'));
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    response = JSON.parse(xhr.responseText);
    response.status = xhr.status;
    if (callback) {
      callback(response);
    }
  }.bind(this);
  xhr.send(JSON.stringify(newUser));
};

/**
* Attempts to authenticate user credentials. If authentication is successful, the JSON Web Token will be stored in local storage, as well as on the Combust instance.
*
*@method authenticate
*
*@param crendentials {Object} credentials Object that contains the username and password of the user to authenticate.
*@param credentials.username username Username of the user authenticate.
*@param credentials.password password Password of the user to authenticate.
*@param *callback(response) {Function} callback(response) The callback to be executed once a response from the server is received. Accepts response as the only parameter.
*Response has three properties: 
*1) 'success' (Boolean) which indicates whether the user was successfully authenticated or not.
*2) 'id' (String) Contains the authenticated users id - only present if success is true.
*3) 'token' (String) Contains the authenticated users authentication JSON Web token - only present is success is true.
*/
Combust.prototype.authenticate = function(credentials, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', encodeURI('http://0.0.0.0:3000/authenticate'));
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    response = JSON.parse(xhr.responseText);
    response.status = xhr.status;
    if (response.token) {
      this.token = response.token;
      //store token in local storage
      localStorage.setItem('token', response.token);
    }
    callback(response);
  }.bind(this);
  xhr.send(JSON.stringify(credentials));
};

/**
* Unauthenticates the current user by disconnecting the socket connection, and delete the authenticaton JSON Web Token from the Combust instance, as well as local storage.
*
*@method authenticate
*/
Combust.prototype.unauthenticate = function() {
  this.socket.disconnect();
  this.token = null;
  localStorage.removeItem('token');
};

module.exports = Combust;