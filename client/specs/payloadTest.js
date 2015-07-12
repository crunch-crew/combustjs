var Payload = require('../Payload');
var should = require('should');

describe('Payload', function() {
  describe('val()', function() {
    it('should return the data stored inside of a payload', function(done) {
      var payload = new Payload({msg: 'hi'});
      var val = payload.val();
      should(val).eql({msg: 'hi'});
      done();
    });
  });

  describe('forEach()', function() {
    it('should iterate through a stored array and wrap each item in an instance of Payload and execute a callback on it', function(done) {
      var payload = new Payload([{val: 1}, {val: 2}, {val: 3}]);
      var payloadVals = [];
      payload.forEach(function(item) {
        payloadVals.push(item.val().val);
      });
      payloadVals.should.eql([1,2,3]);
      done();
    });
  });

  describe('exists()', function() {
    it('should return false if storage is null', function() {
      var payload = new Payload();
      payload.exists().should.equal(false);
    });
    it('should return true if storage is not null', function() {
      var payload = new Payload({msg: 'hi'});
      payload.exists().should.equal(true);
    });
  });

  describe('hasChildren()', function() {
    it('should return false if storage is null', function() {
      var payload = new Payload();
      payload.hasChildren().should.equal(false);
    });
    it('should return false if storage is empty object', function() {
      var payload = new Payload({});
      payload.hasChildren().should.equal(false);
    });
    it('should return true if storage has children', function() {
      var payload = new Payload({msg: 'hi'});
      payload.hasChildren().should.equal(true);
    });
  });

  describe('numChildren()', function() {
    it('should return 0 if storage is null', function() {
      var payload = new Payload();
      payload.numChildren().should.equal(0);
    });
    it('should return 0 if storage is empty object', function() {
      var payload = new Payload({});
      payload.numChildren().should.equal(0);
    });
    it('should return number of children if storage has children', function() {
      var payload = new Payload({msg: 'hi'});
      payload.numChildren().should.equal(1);
      var payload = new Payload({msg: 'hi', test: 'yo'});
      payload.numChildren().should.equal(2);
    });
  });
});
