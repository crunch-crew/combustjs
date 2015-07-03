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
    // path = '/tests/';
    configTest.resetDb(function() {
      db.connect(function(conn) {
        configTest.bulkInsert(path, data, function() {
          callback();
        });
      })
    });
  }


  before(function(done) {
    configTest.resetDb(function() {
      configTest.authenticateSocket(function(newSocket, newAgent) {
        socket = newSocket;
        done();
      });
    })
  });

  after(function(done) {
    configTest.resetDb(function() {
      done();
    });
  });

  describe('un-nested objects', function() {
    it('should find all the added properties between two objects', function(done) {
      var oldObj = {
        name: "Richie"
      }
      var newObj = {
        name: "Richie",
        school: "MKS"
      }
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/'].child_changed.should.eql({name: 'Kuldeep', age: 23});
          results.changeProps.should.eql([['/name/', 'Kuldeep'], ['/age/', 23]]);
          done();
        });
      });
    });

    it('should find all the deleted properties between two objects', function(done) {
      var oldObj = {
        name: "Richie"
      }
      var newObj = {
      }
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.deleteProps.should.eql(['/name/']);
          results.changeProps.should.eql([]);
          results.addProps.should.eql([]);
          done();
        });
      });
    });

    it('should find all the child_added events between two objects', function(done) {
      var oldObj = {
        name: "Richie"
      }
      var newObj = {
        name: "Richie",
        school: "MKS"
      }
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/'].child_added.should.eql([{school: 'MKS'}]);
          done();
        });
      });
    });

    it('should find all the child_changed events between two objects', function(done) {
      var oldObj = {
        name: "Richie",
        age: 22
      }
      var newObj = {
        name: "Kuldeep",
        age: 23
      }
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/'].child_changed.should.eql({name: 'Kuldeep', age: 23});
          done();
        });
      });
    });

    it('should find all the value events between two objects', function(done) {
      var oldObj = {
        name: "Richie",
        age: 22
      }
      var newObj = {
        name: "Kuldeep",
        age: 23
      }
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/'].value.should.eql(newObj);
          results.emitEvents['/name/'].value.should.equal('Kuldeep');
          results.emitEvents['/age/'].value.should.equal(23);
          done();
        });
      });
    });

    it('should find all the child_removed events between two objects', function(done) {
      var oldObj = {
        name: "Richie"
      }
      var newObj = {
      }
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/'].child_removed[0].should.eql({name: "Richie"});
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.changeProps.should.eql([
            ['/userList/user1/name/', 'Jack'],
            ['/userList/user1/messages/list/0/', 'yo']
            ]);
          results.addProps.should.eql([]);
          results.deleteProps.should.eql([]);
          done();
        });
      });
    });

    it('should find all the deleted properties between two objects', function(done) {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.deleteProps.should.eql(['/userList/user1/name/', '/userList/user2/']);
          results.changeProps.should.eql([]);
          results.addProps.should.eql([]);
          done();
        });
      });
    });

    it('should find all the child_added events between two objects', function(done) {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/userList/user1/messages/list/'].child_added.should.eql([{'1': 'richie'}]);
          results.emitEvents['/userList/user2/'].child_added.should.eql([{profile: {names: {first: 'Kuldeep'}}}]);
          results.emitEvents['/userList/'].child_added.should.eql([{user3: {name: 'Alex'}}]);
          done();
        });
      });
    });

    it('should find all the child_changed events between two objects', function(done) {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/userList/user1/messages/list/'].child_changed.should.eql({0: 'yo'});
          results.emitEvents['/userList/user1/messages/'].child_changed.should.eql({list: ['yo', 'richie']});
          results.emitEvents['/userList/user1/'].child_changed.should.eql({messages: {list: ['yo', 'richie']}, name: 'Jack'});
          results.emitEvents['/userList/'].child_changed.should.eql({user1: {name: 'Jack', messages: {list: ['yo', 'richie']}}});
          results.emitEvents['/'].child_changed.should.eql(newObj);
          done();
        });
      });
    });

    it('should find all the value events between two objects', function(done) {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/userList/user1/messages/list/0/'].value.should.eql('yo');
          results.emitEvents['/userList/user1/messages/list/'].value.should.eql(newObj.userList.user1.messages.list);
          results.emitEvents['/userList/user1/messages/'].value.should.eql(newObj.userList.user1.messages);
          results.emitEvents['/userList/user1/'].value.should.eql(newObj.userList.user1);
          results.emitEvents['/userList/'].value.should.eql(newObj.userList);
          results.emitEvents['/'].value.should.eql(newObj);
          var user2Path = '/user2/' in results.emitEvents;
          var user3Path = '/user3/' in results.emitEvents;
          user2Path.should.equal(false);
          user3Path.should.equal(false);
          done();
        });
      });
    });

    it('should find all the child_removed events between two objects', function(done) {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.emitEvents['/userList/user1/'].child_removed.should.eql([{name: 'Richie'}]);
          results.emitEvents['/userList/'].child_removed.should.eql([{user2: {name: 'Kuldeep'}}]);
          should(results.emitEvents['/userList/user1/name/'].value).equal(null);
          results.emitEvents['/userList/user1/'].value.should.eql({});
          results.emitEvents['/userList/'].value.should.eql(newObj.userList);
          should(results.emitEvents['/userList/user2/'].value).equal(null);
          results.emitEvents['/'].value.should.eql(newObj);
          done();
        });
      });
    });
  });

  describe('edge-casing', function() {
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.deleteProps.should.eql(['/userList/user1/name/']);
          results.changeProps.should.eql([]);
          results.addProps.should.eql([]);
          done();
        });
      });
    });

    it('should add to deleteProps if value is undefined', function(done) {
      newObj.userList.user1.name = undefined;
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.changeProps.should.eql([]);
          results.deleteProps.should.eql(['/userList/user1/name/']);
          results.addProps.should.eql([]);
          done();
        });
      });
    });

    it('should add to changeProps if value is NaN', function(done) {
      newObj.userList.user1.name = NaN;
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          results.changeProps.should.eql([['/userList/user1/name/', NaN]]);
          results.addProps.should.eql([]);
          results.deleteProps.should.eql([]);
          done();
        });
      });
    });
  });

  describe('multiple events at once', function() {
    it('should track all events that need to be emitted, as well as change/add/deleteProps', function(done) {
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
          }
        }
      };
      var newObj = {
        userList: {
          user1: {
            name: 'Jack',
            messages: {
              list: ['yo']
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
      insertDb('/tests/', oldObj, function() {
        setDifference('/tests/', newObj, function(results) {
          //child_changed events
          results.emitEvents['/userList/user1/messages/list/'].child_changed.should.eql({0: 'yo'});
          results.emitEvents['/userList/user1/messages/'].child_changed.should.eql({list: ['yo']});
          results.emitEvents['/userList/user1/'].child_changed.should.eql({messages: {list: ['yo']}, name: 'Jack'});
          results.emitEvents['/userList/'].child_changed.should.eql({user1: newObj.userList.user1, user2: newObj.userList.user2});
          results.emitEvents['/'].child_changed.should.eql(newObj);
          results.emitEvents['/userList/user2/'].child_added.should.eql([{profile: {names: {first: 'Kuldeep'}}}]);
          results.emitEvents['/userList/'].child_added.should.eql([{user3: {name: 'Alex'}}]);
          //value_events
          results.emitEvents['/userList/user1/messages/list/0/'].value.should.eql('yo');
          results.emitEvents['/userList/user1/messages/list/'].value.should.eql(newObj.userList.user1.messages.list);
          results.emitEvents['/userList/user1/messages/'].value.should.eql(newObj.userList.user1.messages);
          results.emitEvents['/userList/user1/'].value.should.eql(newObj.userList.user1);
          results.emitEvents['/userList/'].value.should.eql(newObj.userList);
          results.emitEvents['/'].value.should.eql(newObj);
          results.emitEvents['/userList/user2/profile/'].value.should.eql(newObj.userList.user2.profile);
          results.emitEvents['/userList/user3/'].value.should.eql(newObj.userList.user3);
          should(results.emitEvents['/userList/user2/name/']).equal(undefined);
          //child_added events
          results.emitEvents['/userList/user2/'].child_added.should.eql([{profile: {names: {first: 'Kuldeep'}}}]);
          results.emitEvents['/userList/'].child_added.should.eql([{user3: {name: 'Alex'}}]);
          results.emitEvents['/userList/user1/'].child_added.should.eql([]);
          //child_removed events
          results.emitEvents['/userList/user1/messages/list/'].child_removed[0].should.eql({'1': 'richie'});

          //propArrays
          results.changeProps.should.eql([
            ['/userList/user1/name/', 'Jack'],
            ['/userList/user1/messages/list/0/', 'yo']
            ]);
          results.addProps.should.eql([['/userList/user2/profile/', newObj.userList.user2.profile], ['/userList/user3/', newObj.userList.user3]]);
          // results.deleteProps.should.eql(['/userList/user1/messages/list/1/']);
          done();
        });
      });
    });
  });
});



