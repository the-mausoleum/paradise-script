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
    CREATE: 'create',
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

    if (keys[0] === GRAMMAR.CREATE) {
        statement += 'function () {' + CHAR.NEWLINE + CHAR.TAB;

        statement += 'this.name = ' + CHAR.QUOTE;

        for (var i = 1; i < keys.length; i++) {
            var parsed = keyParser(keys[i]);

            if (parsed) {
                continue;
            }

            statement += keys[i] + (i < keys.length - 1 ? CHAR.SPACE : CHAR.EMPTY);
        }

        statement += CHAR.QUOTE + CHAR.SEMICOLON + CHAR.NEWLINE + '}' + CHAR.NEWLINE;
    }

    return statement;
};
