'use strict';

var repl = require('repl');
var stream = require('stream');
var util = require('util');

function Stream() {
    stream.Transform.call(this);
}

util.inherits(Stream, stream.Transform);

Stream.prototype._transform = function (chunk, encoding, callback) {
    var script = chunk.toString();
    var lines = script.split(/\n+/);

    for (var i in lines) {
        if (lines[i] !== '') {
            this.push(lines[i] + '\n');
        }
    }

    callback();
};

var inputStream = new Stream();

var instance = repl.start({
    prompt: 'PARADISE> ',
    input: inputStream,
    output: process.stdout
});

process.stdin.pipe(inputStream);
