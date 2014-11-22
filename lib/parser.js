'use strict';

var CHAR = Object.freeze({
    COMMA: ',',
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
    NAME: 'name',
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

var toPascalCase = function (string) {
    return string.replace('_', ' ').replace(/\w+/g, function (word) {
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
    }).replace(' ', '');
};

var parentVessel = [];
var currentVessel = null;
var children = {};

var getParentVessel = function () {
    return parentVessel[parentVessel.length - 1];
};

var children = {};

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

        if (currentVessel) {
            parentVessel.push(currentVessel);
        }

        currentVessel = vesselName;

        if (getParentVessel()) {
            if (typeof children[getParentVessel()] === 'undefined') {
                children[getParentVessel()] = [];
            }

            children[getParentVessel()].push(currentVessel);
        }

        if (indentLevel === 0) {
            statement += generateIndentation(indentLevel) + 'var ' + vesselName + ' = (function () {' + CHAR.NEWLINE;   
        } else {
            statement += generateIndentation(indentLevel) + 'this.' + vesselName  + ' = (function () {' + CHAR.NEWLINE;
        }

        indentLevel++;

        statement += generateIndentation(indentLevel) + 'var ' + currentVessel + '_' + GRAMMAR.NAME + ' = ' + CHAR.QUOTE + vesselName + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.CREATE_END) {

        statement += generateIndentation(indentLevel) + 'return {' + CHAR.NEWLINE;

        indentLevel++;

        var properties = [GRAMMAR.NAME, GRAMMAR.NOTE, GRAMMAR.PROGRAM, GRAMMAR.USAGE];

        for (var i in properties) {
            statement += generateIndentation(indentLevel) + properties[i] + ': typeof ' + currentVessel + '_' + properties[i] + ' === ' + CHAR.QUOTE + 'undefined' + CHAR.QUOTE + ' ? ' + CHAR.QUOTE + CHAR.QUOTE + ' : ' + currentVessel + '_' + properties[i] + CHAR.COMMA + CHAR.NEWLINE;            
        }

        statement += generateIndentation(indentLevel) + 'children' + ': ' + '[' + CHAR.NEWLINE;

        indentLevel++;

        for (var i in children[currentVessel]) {
            statement += generateIndentation(indentLevel) + 'this.' + children[currentVessel][i] + CHAR.COMMA + CHAR.NEWLINE;
        }

        currentVessel = parentVessel.pop();

        indentLevel--;

        statement += generateIndentation(indentLevel) + ']' + CHAR.NEWLINE

        indentLevel--;

        statement += generateIndentation(indentLevel) + '}' + CHAR.SEMICOLON + CHAR.NEWLINE;

        indentLevel--;

        statement += generateIndentation(indentLevel) + '})();' + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.NOTE || keys[0] === GRAMMAR.PROGRAM || keys[0] === GRAMMAR.USAGE) {
        var propertyName = keys[0];
        var propertyValue = generatePropertyValue(keys);

        statement += generateIndentation(indentLevel) + 'var ' + currentVessel + '_' + propertyName + ' = ' + CHAR.QUOTE + propertyValue + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    return statement;
};
