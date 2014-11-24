'use strict';

var Parser = require('./lib/parser');

var parser = new Parser();

function parse(file) {
    var lines = file.split(/\r?\n/);

    var script = '';

    for (var i in lines) {
        script += parser.parse(lines[i]);
    }

    parser.reset();

    return script;
}

module.exports = parse;
