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
    COMMENT: '#',
    CREATE_START: 'create',
    CREATE_END: 'leave',
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

var generateVesselName = function (keys) {
    keys.shift();

    return keys.join('_');
};

var generatePropertyValue = function (keys) {
    keys.shift();

    return keys.join(' ');
};

module.exports = function parse(line) {
    line = line.replace(/[^A-Z0-9#\,\.\s]/gi, '');

    var keys = line.match(/'[^']+'|\S+/g);
    var statement = '';

    if (keys === null) {
        return line + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.COMMENT) {
        return CHAR.EMPTY;
    }

    if (keys[0] === GRAMMAR.CREATE_START) {
        var vesselName = generateVesselName(keys);

        statement += generateIndentation(indentLevel) + 'function ' + vesselName  + ' () {' + CHAR.NEWLINE;

        indentLevel++;

        statement += generateIndentation(indentLevel) + 'this.name = ' + CHAR.QUOTE + vesselName + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.CREATE_END) {
        indentLevel--;

        statement += generateIndentation(indentLevel) + '}' + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.NOTE || keys[0] === GRAMMAR.PROGRAM || keys[0] === GRAMMAR.USAGE) {
        var propertyName = keys[0];
        var propertyValue = generatePropertyValue(keys);

        statement += generateIndentation(indentLevel) + 'this.' + propertyName + ' = ' + CHAR.QUOTE + propertyValue + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    return statement;
};
