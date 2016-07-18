# Generator Helper

This helps the asynchronous processing using the generator functions.

## Example

This is a sample to search directories recursively.<br>
All I/O processing is performed asynchronously.

```js
'use strict'

var GeneratorHelper = require('../GeneratorHelper');
var Fs = require('fs');

GeneratorHelper.exec(dirs,callback)(".", []);
function callback(err, files) {
    if (err) throw err;
    console.log(files.join("\n"));    
}

function* dirs(path, list) {
    let stat = yield Fs.stat(path, this.callback);
    if (stat.isDirectory()) {
        list.push(path + "/");
        let files = yield Fs.readdir(path, this.callback);
        for (let i = 0; i < files.length; i++) {
            yield this.exec(dirs)(path + "/" + files[i], list);
        }
    } else {
        list.push(path);
    }
    return list;
}
```

This is the result of executing the sample.

```
./GeneratorHelper.js
./README.md
./package.json
./sample/
./sample/sample.js
./test/
./test/test.txt
./test/test1.js
```


## API's

### GeneratorHelper

#### GeneratorHelper#exec(generator,callback)

Convert the generator function into an executable function.<br>
The function of return value calls with any argument.

Argument "generator" is generate function.

Argument "callback" is called at the end of the generator function.
The signature is the callback (error, value).
"Value" is set to the return value of the generator function.


### `this' in Generator function

Generator functions that are performed by the "GeneratorHelper#exec()" will have a special "this".
It has a function to assist in the execution of the Iterator.

#### this#next(value)

Advances one iterator that is stopped at the yield.<br>
Argument "value" will be the return value of the yield.

#### this#callback(error, value)

Internally, it simply calls the "next(value)".
Signature matches the general callback functions of Node.
"Error" is returned to the callback of "GeneratorHelper#exec()".

#### this#exec(generator,callback)

It is the same as the "GeneratorHelper#exec()".
However, the default of the argument "callback" is "this.callback".

## GeneratorHelper source code.

GeneratorHelper.js source code is a little.

```js
'use strict'

var TAG = "GeneratorHelper:";

function exec(generator, callback) {
    function executor() {
        var _this = {};
        var iterator = generator.apply(_this, arguments);
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