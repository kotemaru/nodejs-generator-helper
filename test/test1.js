'use strict'

var assert = require('assert');
var GeneratorHelper = require('../GeneratorHelper');
var Fs = require('fs');

describe('GeneratorHelper', function() {
    this.timeout(5000);
    describe('Normal case', function() {
        it('a', function(done) {
            let count = 0;

            function callback(err, val) {
                console.log('---->', err, val);
                assert.equal(err, null, "err");
                assert.equal(val, "abcdefg123456789");
                count++;
            }

            function callbackDone(err, val) {
                callback(err, val);
                assert.equal(count, 8, "count");
                done();
            }
            GeneratorHelper.exec(generator1, callbackDone)("test/test.txt", 1500);
            GeneratorHelper.exec(generator1, callback)("test/test.txt", 1234);
            GeneratorHelper.exec(generator1, callback)("test/test.txt", 1234);
            GeneratorHelper.exec(generator1, callback)("test/test.txt", 1234);
            GeneratorHelper.exec(generator1, callback)("test/test.txt", 1234);
            GeneratorHelper.exec(generator1, callback)("test/test.txt", 1234);
            GeneratorHelper.exec(generator1, callback)("test/test.txt", 1234);
            GeneratorHelper.exec(generator1, callback)("test/test.txt", 1234);
        });
    });
    describe('Fail case', function() {
        it('a', function(done) {
            function callback(err, val) {
                console.log('---->', err, val);
                try {
                    assert.notEqual(err, null, "err");
                    done();
                }
                catch (e) {
                    done(e);
                }
            }
            GeneratorHelper.exec(generator1, callback)("not-found.txt", 0);
        });
    });
    describe('Fail case2', function() {
        it('a', function(done) {
            function callback(err, val) {
                console.log('---->', err, val);
                try {
                    assert.notEqual(err, null, "err");
                    done();
                }
                catch (e) {
                    done(e);
                }
            }
            GeneratorHelper.exec(generator1, callback)("test/test.txt", -1);
        });
    });
});


function* generator1(fileName, time) {
    let text = "" + (yield Fs.readFile(fileName, this.callback));
    assert.equal(text, "abcdefg123456789");
    let resTime1 = yield this.exec(sleep)(time);
    assert.equal(resTime1, time);
    let resTime2 = yield this.exec(sleep)(0);
    assert.equal(resTime2, 0);
    return text;
}

function* sleep(time) {
    if (time == 0) return 0;
    if (time < 0) throw "bad time";
    let self = this;
    yield setTimeout(function() {
        self.next();
    }, time);
    return time;
}