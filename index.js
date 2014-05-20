var EventEmitter = require('events').EventEmitter;

module.exports = on;

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
   * response for co.
   */
  function response(name, callback) {
    return function() {
      if (!(events[name] && events[name].length)) return false;

      var event = (events[name] || []).splice(0, 1)[0];
      setImmediate(function() {
        callback.apply(null, [null].concat(event));
      });
      return true;
    };
  }

  /**
   * clean.
   */
  function clean(emitter, names, res) {
    return function() {
      names.forEach(function(name) {
        emitter.removeListener(name, res);
      });
      return res.apply(this, arguments);
    };
  }

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
        callback = clean(emitter, names, callback);
        names.forEach(function(name) {
          callback = response(name, callback);

          if (callback()) return;
          emitter.once(name, function() {
            callback();
          });
        });

      };
    }
  };
}

