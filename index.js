var EventEmitter = require('events').EventEmitter;
var slice = Array.prototype.slice;

module.exports = on;

/**
 * on.
 *
 * @param {Object} emitter
 * @return {Object}
 */
function on(emitter) {
  var e = create(emitter);

  var names = slice.call(arguments).slice(1);
  if (names.length) {
    return e.on.apply(e, names);
  }
  return e;
}

/**
 * create co-on object.
 *
 * @param {Object} emitter
 * @return {Object}
 */
function create(emitter) {

  /**
   * events was emitted.
   */
  var events = {};

  /**
   * watching events.
   */
  var emit = emitter.emit;
  emitter.emit = function (name) {
    var args = slice.call(arguments);
    events[name] = events[name] || [];
    events[name].push(args.slice(1));
    emit.apply(emitter, args);
  };

  /**
   * once.
   */
  function once(res) {
    var called = false;
    return function() {
      if (called) return;
      called = true;
      return res.apply(this, arguments);
    };
  }

  /**
   * response for co.
   */
  function response(name, callback) {
    return function() {
      if (!(events[name] && events[name].length)) return false;

      var event = (events[name] || []).splice(0, 1)[0];
      setImmediate(function() {
        setImmediate(function() {
          callback.apply(null, [null].concat(event));
        });
      });
      return true;
    };
  }

  /**
   * export api.
   */
  return {

    /**
     * target event was emitted.
     *
     * @param {String} name
     * @return {Boolean}
     */
    emitted: function(name) {
      return events.hasOwnProperty(name);
    },

    /**
     * yield target event.
     *
     * @param {Arguments.<String>} names
     * @return {Function}
     */
    on: function() {
      var names = slice.call(arguments);
      return function(callback) {
        callback = once(callback);
        names.forEach(function(name) {
          var res = response(name, callback);
          if (res()) return;
          emitter.once(name, res);
        });
      };
    }
  };
}

