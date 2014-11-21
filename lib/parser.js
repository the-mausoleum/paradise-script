'use strict';

module.exports = function parse (line) {
    var keys = line.match(/'[^']+'|\S+/g);
    var statement = '';

    console.log(keys)

    if (keys === null) {
        return line + '\n';
    }

    return statement;
};
