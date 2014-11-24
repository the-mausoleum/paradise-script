'use strict';

var CHAR = Object.freeze({
    ASSIGNMENT: '=',
    BRACE_OPEN: '{',
    BRACE_CLOSE: '}',
    BRACKET_OPEN: '[',
    BRACKET_CLOSE: ']',
    COLON: ':',
    COMMA: ',',
    EMPTY: '',
    EQUALITY: '===',
    NEWLINE: '\n',
    QUESTION: '?',
    QUOTE: '\'',
    SEMICOLON: ';',
    SPACE: ' ',
    TAB: '    ',
    UNDERSCORE: '_'
});

var EXPRESSION = Object.freeze({
    ANON_F_OPEN: '(function () {',
    ANON_F_CLOSE: '})()',
    RETURN: 'return',
    UNDEFINED: 'undefined',
    VAR: 'var'
});

var GRAMMAR = Object.freeze({
    COLOR: 'paint',
    COMMENT: '#',
    CREATE_OPEN: 'create',
    CREATE_CLOSE: 'leave',
    FEEDBACK: 'feedback',
    NAME: 'name',
    NOTE: 'note',
    PROGRAM: 'program',
    USAGE: 'usage'
});

var PROPERTIES = [GRAMMAR.FEEDBACK, GRAMMAR.NAME, GRAMMAR.NOTE, GRAMMAR.PROGRAM, GRAMMAR.USAGE];

var CHILD_COLLECTION = 'children';

var indentLevel;

var pad = function (expression, afterOnly) {
    return (afterOnly ? CHAR.EMPTY : CHAR.SPACE) + expression + CHAR.SPACE;
};

var createIndent = function () {
    var indent = '';

    for (var i = 0; i < indentLevel; i++) {
        indent += CHAR.TAB;
    }

    return indent;
};

var createVesselName = function (keys) {
    keys.shift();

    return keys.join(CHAR.UNDERSCORE);
};

var createPropertyName = function (vessel, property) {
    return vessel + CHAR.UNDERSCORE + property;
};

var createPropertyValue = function (keys) {
    keys.shift();

    return keys.join(' ');
};

var parentVessel;

var getParentVessel = function () {
    return parentVessel[parentVessel.length - 1];
};

var currentVessel;
var has;
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

        if (keys[0] === GRAMMAR.CREATE_OPEN) {
            var vesselName = createVesselName(keys);

            if (currentVessel) {
                parentVessel.push(currentVessel);
            }

            currentVessel = vesselName;

            if (!has[currentVessel]) {
                has[currentVessel] = {};
            }

            has[currentVessel].name = true;

            if (getParentVessel()) {
                if (typeof children[getParentVessel()] === EXPRESSION.UNDEFINED) {
                    children[getParentVessel()] = [];
                }

                children[getParentVessel()].push(currentVessel);
            }

            if (indentLevel === 0) {
                statement += createIndent() + EXPRESSION.ANON_F_OPEN + CHAR.NEWLINE;
            } else {
                statement += createIndent() + pad(EXPRESSION.VAR, true) + vesselName + pad(CHAR.ASSIGNMENT) + EXPRESSION.ANON_F_OPEN + CHAR.NEWLINE;
            }

            indentLevel++;

            statement += createIndent() + pad(EXPRESSION.VAR, true) + createPropertyName(currentVessel, GRAMMAR.NAME) + pad(CHAR.ASSIGNMENT) + CHAR.QUOTE + vesselName + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
        }

        if (keys[0] === GRAMMAR.CREATE_CLOSE) {

            statement += CHAR.NEWLINE + createIndent() + pad(EXPRESSION.RETURN, true) + CHAR.BRACE_OPEN + CHAR.NEWLINE;

            indentLevel++;

            for (var i in PROPERTIES) {
                statement += createIndent() + PROPERTIES[i] + pad(CHAR.COLON, true);

                if (has[currentVessel] && has[currentVessel][PROPERTIES[i]]) {
                    statement += currentVessel + CHAR.UNDERSCORE + PROPERTIES[i];
                } else {
                    statement += CHAR.QUOTE + CHAR.QUOTE;
                }

                statement += CHAR.COMMA + CHAR.NEWLINE
            }

            statement += createIndent() + CHILD_COLLECTION + pad(CHAR.COLON, true) + CHAR.BRACKET_OPEN + CHAR.NEWLINE;

            indentLevel++;

            for (var i in children[currentVessel]) {
                statement += createIndent() + children[currentVessel][i] + CHAR.COMMA + CHAR.NEWLINE;
            }

            currentVessel = parentVessel.pop();

            indentLevel--;

            statement += createIndent() + CHAR.BRACKET_CLOSE + CHAR.NEWLINE

            indentLevel--;

            statement += createIndent() + CHAR.BRACE_CLOSE + CHAR.SEMICOLON + CHAR.NEWLINE;

            indentLevel--;

            statement += createIndent() + EXPRESSION.ANON_F_CLOSE + CHAR.SEMICOLON + CHAR.NEWLINE;
        }

        if (keys[0] === GRAMMAR.FEEDBACK || keys[0] === GRAMMAR.NOTE || keys[0] === GRAMMAR.PROGRAM || keys[0] === GRAMMAR.USAGE) {
            var propertyName = keys[0];
            var propertyValue = createPropertyValue(keys);

            has[currentVessel][propertyName] = true;

            statement += createIndent() + pad(EXPRESSION.VAR, true) + createPropertyName(currentVessel, propertyName) + pad(CHAR.ASSIGNMENT) + CHAR.QUOTE + propertyValue + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
        }

        return statement;
    };

    this.reset = function () {
        indentLevel = 0;
        parentVessel = [];
        currentVessel = null;
        has = {};
        children = {};
    };

    this.reset();
};

module.exports = Parser;
