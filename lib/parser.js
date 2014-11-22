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

var generateIndent = function () {
    var indent = '';

    for (var i = 0; i < indentLevel; i++) {
        indent += CHAR.TAB;
    }

    return indent;
};

var generateVesselName = function (keys) {
    keys.shift();

    return keys.join('_');
};

var generatePropertyName = function (vessel, property) {
    return 'var ' + vessel + '_' + property;
};

var generatePropertyValue = function (keys) {
    keys.shift();

    return keys.join(' ');
};

var parentVessel = [];

var getParentVessel = function () {
    return parentVessel[parentVessel.length - 1];
};

var currentVessel = null;
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
            statement += generateIndent() + 'var ' + vesselName + ' = (function () {' + CHAR.NEWLINE;   
        } else {
            statement += generateIndent() + 'this.' + vesselName  + ' = (function () {' + CHAR.NEWLINE;
        }

        indentLevel++;

        statement += generateIndent() + generatePropertyName(currentVessel, GRAMMAR.NAME) + ' = ' + CHAR.QUOTE + vesselName + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.CREATE_END) {

        statement += generateIndent() + 'return {' + CHAR.NEWLINE;

        indentLevel++;

        var properties = [GRAMMAR.NAME, GRAMMAR.NOTE, GRAMMAR.PROGRAM, GRAMMAR.USAGE];

        for (var i in properties) {
            statement += generateIndent() + properties[i] + ': typeof ' + generatePropertyName(currentVessel, properties[i]) + ' === ' + CHAR.QUOTE + 'undefined' + CHAR.QUOTE + ' ? ' + CHAR.QUOTE + CHAR.QUOTE + ' : ' + currentVessel + '_' + properties[i] + CHAR.COMMA + CHAR.NEWLINE;            
        }

        statement += generateIndent() + 'children' + ': ' + '[' + CHAR.NEWLINE;

        indentLevel++;

        for (var i in children[currentVessel]) {
            statement += generateIndent() + 'this.' + children[currentVessel][i] + CHAR.COMMA + CHAR.NEWLINE;
        }

        currentVessel = parentVessel.pop();

        indentLevel--;

        statement += generateIndent() + ']' + CHAR.NEWLINE

        indentLevel--;

        statement += generateIndent() + '}' + CHAR.SEMICOLON + CHAR.NEWLINE;

        indentLevel--;

        statement += generateIndent() + '})();' + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.NOTE || keys[0] === GRAMMAR.PROGRAM || keys[0] === GRAMMAR.USAGE) {
        var propertyName = keys[0];
        var propertyValue = generatePropertyValue(keys);

        statement += generateIndent() + generatePropertyName(currentVessel, propertyName) + ' = ' + CHAR.QUOTE + propertyValue + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    return statement;
};
