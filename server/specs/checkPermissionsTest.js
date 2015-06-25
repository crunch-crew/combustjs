var checkPermission = require('../utils/checkPermissions');
var rules = require('./utils/authorizationTest');
var should = require('should');

describe('checkPermission tests', function() {
  it('should return an object that contains read/write properties', function(done) {
    var permissions = checkPermission('/this/is/a/path');
    permissions.read.should.exist;
    permissions.write.should.exist;
    done();
  });

  it('should default permissions to true if none exist', function(done) {
    var permissions = checkPermission('this/path/does/not/have/permissions');
    permissions.read.should.equal(false);
    permissions.write.should.equal(false);
    done();
  });

  it('should use the most relevant rules that are available to a url', function(done) {
    var permissions = checkPermission('/root/authtest/authtestnested/', rules);
    permissions.read.should.equal(true);
    permissions.write.should.equal(false);
    done();
  });

  it('should refer to parent permissions when specific permissions are missing', function(done) {
    var permissions = checkPermission('/root/authtest/authtestnested/morenesting/', rules);
    permissions.read.should.equal(false);
    permissions.write.should.equal(false);
    done();
  });
});
