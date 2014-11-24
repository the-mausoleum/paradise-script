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
    FEEDBACK: 'feedback',
    NAME: 'name',
    NOTE: 'note',
    PROGRAM: 'program',
    USAGE: 'usage'
});

var indentLevel;

var createIndent = function () {
    var indent = '';

    for (var i = 0; i < indentLevel; i++) {
        indent += CHAR.TAB;
    }

    return indent;
};

var createVesselName = function (keys) {
    keys.shift();

    return keys.join('_');
};

var createPropertyName = function (vessel, property) {
    return vessel + '_' + property;
};

var createPropertyValue = function (keys) {
    keys.shift();

    return keys.join(' ');
};

var createTernaryStatement = function (cond, tExpression, fExpression) {
    return cond + ' ? ' + tExpression + ' : ' + fExpression;
};

var createUndefinedCheck = function (variable, tExpression, fExpression) {
    return createTernaryStatement('typeof ' + variable + ' === ' + CHAR.QUOTE + 'undefined' + CHAR.QUOTE, tExpression, fExpression);
};

var parentVessel;

var getParentVessel = function () {
    return parentVessel[parentVessel.length - 1];
};

var currentVessel;
var children;

var Parser = function () {
    this.parse = function (line) {
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
            var vesselName = createVesselName(keys);

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
                statement += createIndent() + '(function () {' + CHAR.NEWLINE;
            } else {
                statement += createIndent() + 'var ' + vesselName  + ' = (function () {' + CHAR.NEWLINE;
            }

            indentLevel++;

            statement += createIndent() + 'var ' + createPropertyName(currentVessel, GRAMMAR.NAME) + ' = ' + CHAR.QUOTE + vesselName + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
        }

        if (keys[0] === GRAMMAR.CREATE_END) {

            statement += createIndent() + 'return {' + CHAR.NEWLINE;

            indentLevel++;

            var properties = [GRAMMAR.NAME, GRAMMAR.NOTE, GRAMMAR.PROGRAM, GRAMMAR.USAGE];

            for (var i in properties) {
                statement += createIndent() + properties[i] + ': ' + createUndefinedCheck(createPropertyName(currentVessel, properties[i]), CHAR.QUOTE + CHAR.QUOTE, currentVessel + '_' + properties[i]) + CHAR.NEWLINE;
            }

            statement += createIndent() + 'children' + ': ' + '[' + CHAR.NEWLINE;

            indentLevel++;

            for (var i in children[currentVessel]) {
                statement += createIndent() + children[currentVessel][i] + CHAR.COMMA + CHAR.NEWLINE;
            }

            currentVessel = parentVessel.pop();

            indentLevel--;

            statement += createIndent() + ']' + CHAR.NEWLINE

            indentLevel--;

            statement += createIndent() + '}' + CHAR.SEMICOLON + CHAR.NEWLINE;

            indentLevel--;

            statement += createIndent() + '})();' + CHAR.NEWLINE;
        }

        if (keys[0] === GRAMMAR.FEEDBACK || keys[0] === GRAMMAR.NOTE || keys[0] === GRAMMAR.PROGRAM || keys[0] === GRAMMAR.USAGE) {
            var propertyName = keys[0];
            var propertyValue = createPropertyValue(keys);

            statement += createIndent() + 'var ' + createPropertyName(currentVessel, propertyName) + ' = ' + CHAR.QUOTE + propertyValue + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
        }

        return statement;
    };

    this.reset = function () {
        indentLevel = 0;
        parentVessel = [];
        currentVessel = null;
        children = {};
    };

    this.reset();
};

module.exports = Parser;
