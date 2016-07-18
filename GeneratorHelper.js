
'use strict'

var TAG = "GeneratorHelper:";

function exec(generator, callback) {
    function runner() {
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
        _this.callbackNoError = function(val) {
            _this.next(val);
        };
        _this.exec = thisExec;
        _this.next();
    }
    return runner;
}

function thisExec(generator, callback) {
    if (callback === undefined) callback = this.callback;
    return exec(generator, callback);
}

exports.exec = exec;
