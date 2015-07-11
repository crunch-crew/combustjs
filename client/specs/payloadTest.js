var Payload = require('../bower/lib/Payload');
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
});
