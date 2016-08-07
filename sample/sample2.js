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
    let sleeped = yield this.exec(sleep)(3000);
    console.log(new Date(), "wake up=",sleeped);
}

YieldHelper.exec(sample)();
