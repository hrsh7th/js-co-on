co-on
========

co based event handling.

usage
--------
```js
var co = require('co');
var on = require('co-on');
var fs = require('fs');

co(function*() {
  var stream = fs.createReadStream('sample.txt');
  var e = on(stream)

  var data = '';
  while (!e.emitted('end')) {
    data += yield e.on('data');
  }
  console.log(data);
});

```

api
--------
#### ```var e = on(emitter);```
- args
  - emitter
    - EventEmitter instance.
- return
  - co-on object.

#### ```yield e.on(type)```
- args
  - type
    - event name.
- return
  - EventEmitter#emit(type, ```...```);

#### ```e.emitted(type)```
- args
  - type
    - event name.
- return
  - emitted event value.

#### ```e.hasEmittedEvent(type)```
- args
  - type
    - event name.
- return
  - event was saved  by co-on.
    - if returned true,  can return event results immediately.

