var checkPermissions = require('../utils/checkPermissions');
var rules = require('./utils/authorizationTest');
var should = require('should');

describe('checkPermissions tests', function() {
  describe("permission nesting", function() {
    it('should return null if no path or options are passed', function(done) {
      var permissions = checkPermissions({});
      if (permissions === null) {
        permissions = checkPermissions();
        if (permissions === null) {
          done();
        }
      }
    });

    it('should return an object that contains read/write properties', function(done) {
      var permissions = checkPermissions({path: '/this/is/a/path'});
      permissions.read.should.exist;
      permissions.write.should.exist;
      done();
    });

    it('should default permissions to true if none exist', function(done) {
      var permissions = checkPermissions({path: 'this/path/does/not/have/permissions'});
      permissions.read.should.equal(false);
      permissions.write.should.equal(false);
      done();
    });

    it('should use the most relevant rules that are available to a url', function(done) {
      var permissions = checkPermissions({path: '/root/authtest/authtestnested/', rules: rules});
      permissions.read.should.equal(true);
      permissions.write.should.equal(false);
      done();
    });

    it('should refer to parent permissions when specific permissions are missing', function(done) {
      var permissions = checkPermissions({path: '/root/authtest/authtestnested/morenesting/', rules: rules});
      permissions.read.should.equal(false);
      permissions.write.should.equal(false);
      done();
    });
  });

  describe('should replace tokens with their actual values', function() {
    it('should replace user token with user object and evaluate expression correctly', function(done) {
      var permissions = checkPermissions({path: '/users/', rules: rules, user: {id: 3}});
      permissions.read.should.equal(true);
      done();
    });

    it('should replace data token with data object and evaluate expression correctly', function(done) {
      var permissions = checkPermissions({path: '/users/', rules: rules, user: {id: 3}, data: {name: "test"}});
      permissions.write.should.equal(true);
      done();
    });

    // it('should')
  })
});
