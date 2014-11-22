'use strict';

var fs = require('fs');
var path = require('path');
var repl = require('repl');
var stream = require('stream');
var util = require('util');

var argv = require('optimist').usage('Usage: paradise <file>').argv;
var Parser = require('./parser');

var parser = new Parser();

if (argv._[0]) {
    var file = fs.readFile(path.resolve(process.cwd(), argv._[0]), {
        encoding: 'utf-8'
    }, function (err, script) {
        var lines = script.split(/\r?\n/);

        var output = '';

        for (var i in lines) {
            output += parser.parse(lines[i]);
        }

        parser.reset();

        process.stdout.write(output);
    });
} else {
    var Stream = function () {
        stream.Transform.call(this);
    };

    util.inherits(Stream, stream.Transform);

    Stream.prototype._transform = function (chunk, encoding, callback) {
        var script = parser.parse(chunk.toString());
        var lines = script.split(/\n+/);

        for (var i in lines) {
            if (lines[i] !== '') {
                this.push(lines[i] + '\n');
            }
        }

        parser.reset();

        callback();
    };

    var inputStream = new Stream();

    var instance = repl.start({
        prompt: 'PARADISE> ',
        input: inputStream,
        output: process.stdout
    });

    process.stdin.pipe(inputStream);
}
