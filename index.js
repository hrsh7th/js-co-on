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
   * listeners.
   */
  var listeners = {};

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
   * clean.
   */
  function clean(callback, names) {
    return function() {
      names.forEach(function(name) {
        if (listeners[name]) {
          emitter.removeListener(name, listeners[name]);
        }
      });
      return callback.apply(this, arguments);
    };
  }

  /**
   * response for co.
   */
  function response(callback, name) {
    return function() {
      if (!(events[name] && events[name].length)) return false;

      var event = (events[name] || []).splice(0, 1)[0];
      callback.apply(null, [null].concat(event));
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
        setImmediate(function() {
          setImmediate(function() {
            for (var i = 0; i < names.length; i++) {
              var name = names[i];

              callback = response(callback, name);
              if (callback()) break;
              emitter.on(name, listeners[name] = clean(callback, names));
            }
          });
        });
      };
    }
  };
}

