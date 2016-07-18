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

