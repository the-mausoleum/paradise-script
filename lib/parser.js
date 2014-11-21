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

var validKeys = Object.freeze({

});

module.exports = function parse (line) {
    var keys = line.match(/'[^']+'|\S+/g);
    var statement = '';

    console.log(keys)

    var keyParser = function (key) {
        if (validKeys.hasOwnProperty(key)) {
            statement += validKeys[key];

            return true;
        }

        return false;
    };

    if (keys === null) {
        return line + '\n';
    }

    if (keys[0] === GRAMMAR.START_CREATE) {
        keys.shift();

        var vesselName = keys.join('_');

        statement += 'function ' + vesselName  + ' () {' + CHAR.NEWLINE;

        statement += CHAR.TAB + 'this.name = ' + CHAR.QUOTE + vesselName + CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.END_CREATE) {
        statement += '}' + CHAR.NEWLINE;
    }

    if (keys[0] === GRAMMAR.NOTE || keys[0] === GRAMMAR.PROGRAM || keys[0] === GRAMMAR.USAGE) {
        statement += CHAR.TAB + 'this.' + keys[0] + ' = ' + CHAR.QUOTE;

        for (var i = 1; i < keys.length; i++) {
            var parsed = keyParser(keys[i]);

            if (parsed) {
                continue;
            }

            statement += keys[i] + (i < keys.length - 1 ? CHAR.SPACE : CHAR.EMPTY);
        }

        statement += CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE;
    }

    return statement;
};
