var EventEmitter = require('events').EventEmitter;
var assert = require('assert');
var fs = require('fs');
var co = require('co');
var on = require('../index');

describe('co-on', function() {

  it('emitter', function(done) {
    co(function*() {
      var emitter = new EventEmitter();
      var e = on(emitter);

      setTimeout(function() {
        emitter.emit('data', 'data');
      }, 1000);

      var data = yield e.on('data');
      assert.equal(data, 'data');
    })(done);
  });

  it('stream', function(done) {
    co(function*() {
      var stream = fs.createReadStream(__dirname + '/fixtures/fixture.txt').resume();
      var e = on(stream);

      var data = '';
      while (!e.emitted('end')) {
        data += yield e.on('data', 'end');
      }
      assert.ok(e.emitted('data'));
      assert.ok(e.emitted('end'));
      assert.equal(stream.listeners('data').length, 0);
      assert.equal(stream.listeners('end').length, 1);
      assert.equal(data, 'data\n');
    })(done);
  });

});

