var should = require('should');
var r = require('rethinkdb');
var db = require('../db');
var configTest = require('./configTest');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

var setDifference = require('../utils/setDifference');

describe('setDifference', function() {
  var socket;
  var insertDb = function(path, data, callback) {
    socket.once(path + '-setSuccess', function() {
      callback();
    })
    socket.emit('set', {path: path, data: data}); 
  }

  before(function(done) {
    configTest.authenticateSocket(function(newSocket, newAgent) {
      socket = newSocket;
      done();
    });
  });

  after(function(done) {
    configTest.resetDb(function() {
      done();
    });
  });

  describe('un-nested objects', function() {
    it('should find all the added properties and events between two objects', function(done) {
      var oldObj = {
        name: "Richie"
      }
      var newObj = {
        name: "Richie",
        school: "MKS"
      }
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.addProps.should.eql([['/school/', 'MKS']]);
          results.changeProps.should.eql([]);
          results.deleteProps.should.eql([]);
          results.emitEvents['/'].child_added.should.eql([{school: 'MKS'}]);
          done();
        });
      });
    });

    it('should find all the changed properties between two objects', function(done) {
      var oldObj = {
        name: "Richie",
        age: 22
      }
      var newObj = {
        name: "Kuldeep",
        age: 23
      }
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          // console.log("results: ", results.emitEvents['/'].child_changed);
          results.emitEvents['/'].child_changed.should.eql({name: 'Kuldeep', age: 23});
          results.changeProps.should.eql([['/name/', 'Kuldeep'], ['/age/', 23]]);
          done();
        });
      });
    });

    xit('should find all the deleted properties between two objects', function(done) {
      var oldObj = {
        name: "Richie"
      }
      var newObj = {
      }
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.deleteProps.should.eql(['/name/']);
          results.changeProps.should.eql([]);
          results.addProps.should.eql([]);
          done();
        });
      });
    });
  });

  describe('nested objects', function() {
    it('should find all the added properties between two objects', function(done) {
      var oldObj = {
        userList: {
          user1: {
            name: 'Richie',
            messages: {
              list: ["hi"]
            }
          },
          user2: {
            name: 'Kuldeep'
          }
        }
      };
      var newObj = {
        userList: {
          user1: {
            name: 'Richie',
            messages: {
              list: ['hi', 'richie']
            }
          },
          user2: {
            name: 'Kuldeep',
            profile: {
              names: {
                first: 'Kuldeep'
              }
            }
          },
          user3: {
            name: 'Alex'
          }
        }
      };
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.addProps.should.eql([
            ['/userList/user1/messages/list/1/', 'richie'],
            ['/userList/user2/profile/', {names: {first: 'Kuldeep'}}],
            ['/userList/user3/', {name: 'Alex'}]
            ]);
          results.changeProps.should.eql([]);
          results.deleteProps.should.eql([]);
          results.emitEvents['/userList/user1/messages/list/'].child_added.should.eql([{'1': 'richie'}]);
          results.emitEvents['/userList/user2/'].child_added.should.eql([{profile: {names: {first: 'Kuldeep'}}}]);
          results.emitEvents['/userList/'].child_added.should.eql([{user3: {name: 'Alex'}}]);
          done();
        });
      });
    });

    it('should find all the changed properties between two objects', function(done) {
      var oldObj = {
        userList: {
          user1: {
            name: 'Richie',
            messages: {
              list: ['hi', 'richie']
            }
          },
          user2: {
            name: 'Kuldeep',
            profile: {
              names: {
                first: 'Kuldeep'
              }
            }
          },
          user3: {
            name: 'Alex'
          }
        }
      };
      var newObj = {
        userList: {
          user1: {
            name: 'Jack',
            messages: {
              list: ['yo', 'richie']
            }
          },
          user2: {
            name: 'Kuldeep',
            profile: {
              names: {
                first: 'Kuldeep'
              }
            }
          },
          user3: {
            name: 'Alex'
          }
        }
      };
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.changeProps.should.eql([
            ['/userList/user1/name/', 'Jack'],
            ['/userList/user1/messages/list/0/', 'yo']
            ]);
          // emit tests
          results.emitEvents['/userList/user1/messages/list/'].child_changed.should.eql({0: 'yo'});
          results.emitEvents['/userList/user1/messages/'].child_changed.should.eql({list: ['yo', 'richie']});
          results.emitEvents['/userList/user1/'].child_changed.should.eql({messages: {list: ['yo', 'richie']}});
          results.emitEvents['/userList/'].child_changed.should.eql({user1: {name: 'Jack', messages: {list: ['yo', 'richie']}}});
          results.emitEvents['/'].child_changed.should.eql(newObj);

          //
          results.addProps.should.eql([]);
          results.deleteProps.should.eql([]);
          done();
        });
      });
    });

    xit('should find all the deleted properties between two objects', function(done) {
      var oldObj = {
        userList: {
          user1: {
            name: 'Richie'
          },
          user2: {
            name: 'Kuldeep'
          }
        }
      }
      var newObj = {
        userList: {
          user1: {
          },
        }
      }
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.deleteProps.should.eql(['/userList/user1/name/', '/userList/user2/']);
          results.changeProps.should.eql([]);
          results.addProps.should.eql([]);
          done();
        });
      });
    });
  });

  xdescribe('edge-casing', function() {
    var oldObj = {
      userList: {
        user1: {
          name: 'Richie'
        }
      }
    }
    var newObj = {
      userList: {
        user1: {
          name: null
        }
      }
    }
    it('should add to deleteProps if value is null', function(done) {
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.deleteProps.should.eql(['/userList/user1/name/']);
          results.changeProps.should.eql([]);
          results.addProps.should.eql([]);
          done();
        });
      });
    });

    it('should add to deleteProps if value is undefined', function(done) {
      newObj.userList.user1.name = undefined;
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.changeProps.should.eql([]);
          results.deleteProps.should.eql(['/userList/user1/name/']);
          results.addProps.should.eql([]);
          done();
        });
      });
    });

    it('should add to changeProps if value is NaN', function(done) {
      newObj.userList.user1.name = NaN;
      insertDb('/', oldObj, function() {
        setDifference('/', newObj, function(results) {
          results.changeProps.should.eql([['/userList/user1/name/', NaN]]);
          results.addProps.should.eql([]);
          results.deleteProps.should.eql([]);
          done();
        });
      });
    });
  });
});
