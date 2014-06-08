co-on
========

[![Build Status](https://travis-ci.org/hrsh7th/js-co-on.png?branch=master)](https://travis-ci.org/hrsh7th/js-co-on)

co based event handling.

usage
--------
```js
var co = require('co');
var on = require('co-on');

co(function*() {
  var db = require('db');
  db.connect('localhost/example');
  yield on(db, 'connect');
  console.log('connect success.');
});
```

```js
var co = require('co');
var on = require('co-on');
var fs = require('fs');

co(function*() {
  var stream = fs.createReadStream('sample.txt').resume();
  var e = on(stream)

  var data = '';
  while (!e.emitted('end')) {
    // waiting 'data' or 'end' envets.
    data += yield e.on('data', 'end');
  }
  console.log(data);
});
```

api
--------
#### ```var e = on(emitter, [...types]);```
- args
  - emitter
    - EventEmitter instance.
  - ...types
    - event names.
- return
  - thunk or co-on object.

#### ```yield e.on(...types)```
- args
  - ...types
    - event names.
      - see usage.
- return
  - EventEmitter#emit(type, ```...```);

#### ```e.emitted(type)```
- args
  - type
    - event name.
- return
  - whether event was already emitted.


todo
--------
- error event handling.

