(function () {
    var hotel_name = 'hotel';
    var lobby = (function () {
        var lobby_name = 'lobby';

        return {
            feedback: '',
            name: lobby_name,
            note: '',
            paint: '',
            program: '',
            usage: '',
            children: [
            ]
        };
    })();

    return {
        feedback: '',
        name: hotel_name,
        note: '',
        paint: '',
        program: '',
        usage: '',
        children: [
            lobby,
        ]
    };
})();
