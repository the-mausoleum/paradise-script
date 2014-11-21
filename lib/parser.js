'use strict';

var CHAR = Object.freeze({
    EMPTY: '',
    NEWLINE: '\n',
    QUOTE: '\'',
    SEMICOLON: ';',
    SPACE: ' ',
    TAB: '    '
});

var GRAMMAR = Object.freeze({
    COLOR: 'paint',
    START_CREATE: 'create',
    END_CREATE: 'close',
    NOTE: 'note',
    PROGRAM: 'program',
    USAGE: 'usage'
});

var indentLevel = 0;

var generateIndentation = function (level) {
    var indent = '';

    for (var i = 0; i < level; i++) {
        indent += CHAR.TAB;
    }

    return indent;
};

module.exports = function parse (line) {
    var keys = line.match(/'[^']+'|\S+/g);
    var statement = '';

    console.log(keys)

    if (keys === null) {
        return line + '\n';
    }

    if (keys[0] === GRAMMAR.START_CREATE) {
        keys.shift();

        var vesselName = keys.join('_');

        statement += generateIndentation(indentLevel) + 'function ' + vesselName  + ' () {' + CHAR.NEWLINE;

        indentLevel++;

        statement += generateIndentation(indentLevel) + 'this.name = ' + CHAR.QUOTE + vesselName + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.END_CREATE) {
        indentLevel--;

        statement += generateIndentation(indentLevel) + '}' + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.NOTE || keys[0] === GRAMMAR.PROGRAM || keys[0] === GRAMMAR.USAGE) {
        statement += generateIndentation(indentLevel) + 'this.' + keys[0] + ' = ' + CHAR.QUOTE;

        for (var i = 1; i < keys.length; i++) {
            statement += keys[i] + (i < keys.length - 1 ? CHAR.SPACE : CHAR.EMPTY);
        }

        statement += CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    return statement;
};
