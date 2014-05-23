var EventEmitter = require('events').EventEmitter;

module.exports = on;

/**
 * waiting events immediately.
 */
on.now = function(emitter) {
  var e = on(emitter);
  return e.on.apply(e, Array.prototype.slice.call(arguments, [1]));
};

/**
 * on.
 *
 * @param {Object} emitter
 */
function on(emitter) {

  /**
   * events was emitted.
   */
  var events = {};

  /**
   * watching events.
   */
  var emit = emitter.emit;
  emitter.emit = function (name) {
    var args = Array.prototype.slice.call(arguments);
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
   * clean.
   */
  function clean(name, names, emitter, res) {
    return function listener() {
      names.forEach(function(_) {
        if (name !== _) emitter.removeListener(_, listener);
      });
      return res.apply(this, arguments);
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
      var names = Array.prototype.slice.call(arguments);
      return function(callback) {
        callback = once(callback);
        names.forEach(function(name) {
          var res = callback;
          res = clean(name, names, emitter, res);
          res = response(name, res);
          if (res()) return;
          emitter.once(name, res);
        });
      };
    }
  };
}

