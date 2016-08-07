# Yield Helper

This helps the asynchronous processing using the generator functions.

## Example

### Async I/O

This is a sample to search directories recursively.<br>
All I/O processing is performed asynchronously.

```js
'use strict'
var YieldHelper = require('../YieldHelper');
var Fs = require('fs');

function* fileTree(path, list) {
    let stat = yield Fs.stat(path, this.callback);
    if (stat.isDirectory()) {
        list.push(path + "/");
        let files = yield Fs.readdir(path, this.callback);
        for (let i = 0; i < files.length; i++) {
            yield this.exec(fileTree)(path + "/" + files[i], list);
        }
    } else {
        list.push(path);
    }
    return list;
}

function callback(err, files) {
    if (err) throw err;
    console.log(files.join("\n"));    
}
YieldHelper.exec(fileTree,callback)(".", []);
```

This is the result of executing the sample.

```
./YieldHelper.js
./README.md
./package.json
./sample/
./sample/sample.js
./test/
./test/test.txt
./test/test1.js
```

### Async sleep

Implement a sleep without stopping the nodejs.

```js
'use strict'
var YieldHelper = require('../YieldHelper');

function* sleep(ms) {
    let self = this;
    let current = new Date().getTime();
    let sleeped = yield setTimeout(function(){
        self.next(new Date().getTime() - current);
    }, ms);
    return sleeped;
}

function* sample() {
    console.log(new Date(), "sleeping");
    let sleeped = yield this.exec(sleep)(3000); // default callback is 'this.callback'.
    console.log(new Date(), "wake up=",sleeped);
}

YieldHelper.exec(sample)();
```

This is the result of executing the sleep sample.

```
Sun Aug 07 2016 02:59:18 GMT+0000 (UTC) 'sleeping'
Sun Aug 07 2016 02:59:21 GMT+0000 (UTC) 'wake up=' 3003
```

## API's

### YieldHelper

#### YieldHelper#exec(generator,callback)

Convert the generator function into an executable function.<br>
The function of return value calls with any argument.

Argument "generator" is generate function.

Argument "callback" is called at the end of the generator function.<br>
The signature is the callback (error, value).<br>
"Value" is set to the return value of the generator function.


### `this' in Generator function

Generator functions that are performed by the "YieldHelper#exec()" will have a special "this".<br>
It has a function to assist in the execution of the Iterator.

#### this#next(value)

Advances one iterator that is stopped at the yield.<br>
Argument "value" will be the return value of the yield.

#### this#callback(error, value)

Internally, it simply calls the "next(value)".<br>
Signature matches the general callback functions of Node.<br>
"Error" is returned to the callback of "YieldHelper#exec()".

#### this#exec(generator,callback)

It is the same as the "YieldHelper#exec()".<br>
However, the default of the argument "callback" is "this.callback".

## YieldHelper source code.

YieldHelper.js source code is a little.

```js
'use strict'
var TAG = "YieldHelper:";

function exec(generator, callback) {
    function executor() {
        let _this = {};
        let iterator = generator.apply(_this, arguments);
        _this.next = function(arg) {
            _this.isRunning = true;
            try {
                let rc = iterator.next(arg);
                if (rc.done && callback) callback(null, rc.value);
            } catch (err) {
                if (callback) callback(err);
            } finally {
                _this.isRunning = false;
            }
        };
        _this.callback = function(err, val) {
            if (err) {
                if (callback) callback(err);
                else throw err;
                return;
            }
            if (_this.isRunning) {
                setTimeout(function() {_this.next(val);}, 1);
            } else {
                _this.next(val);
            }
        };
        _this.exec = thisExec;
        _this.next();
    }
    return executor;
}

function thisExec(generator, callback) {
    if (callback === undefined) callback = this.callback;
    return exec(generator, callback);
}

exports.exec = exec;
```
