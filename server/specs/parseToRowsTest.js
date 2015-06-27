var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var should = require('should');
var configTest = require('./configTest');

var utils = configTest.utils;

describe('parseToRows', function() {
  testObjDummy = {
      users: {
        user1: {
          name: "richie"
        },
        user2: {
          name: "kuldeep"
        },
        user: {
          name: "jack",
          something: ['hi', {something: 'hi'}]
        }
      },
      activated: true,
      messedUp: false,
      test: {
        name: "viable"
      }
    };

  it('should parse nested objects into rows', function(done) {
    var rows = parseToRows(testObjDummy,"/root/", 'testObj');
    rows.should.eql([ 
      { path: '/root/testObj/users/', _id: 'user1', name: 'richie' },
      { path: '/root/testObj/users/', _id: 'user2', name: 'kuldeep' },
      { path: '/root/testObj/users/user/something/', _id: '1', something: 'hi', _partArray: true },
      { '0': 'hi', path: '/root/testObj/users/user/', _id: 'something', _isArray: true, _length: 2 },
      { path: '/root/testObj/users/', _id: 'user', name: 'jack' },
      { path: '/root/testObj/', _id: 'users' },
      { path: '/root/testObj/', _id: 'test', name: 'viable' },
      { path: '/root/', _id: 'testObj', activated: true, messedUp: false } ]);
    done();
  });
});

