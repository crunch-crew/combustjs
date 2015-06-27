var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var should = require('should');
var configTest = require('./configTest');

var utils = configTest.utils;

describe('parseToObj', function() {
  it('should parse database rows into objects', function(done) {
    var obj = parseToObj(utils.testRows.testRoot, utils.testRows.testChildren);
    obj.should.eql(utils.testObj);
    done();
  });
});

