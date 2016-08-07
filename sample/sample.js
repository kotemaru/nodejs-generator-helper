'use strict'

var YieldHelper = require('../YieldHelper');
var Fs = require('fs');

YieldHelper.exec(fileTree,callback)(".", []);
function callback(err, files) {
    if (err) throw err;
    console.log(files.join("\n"));    
}

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

