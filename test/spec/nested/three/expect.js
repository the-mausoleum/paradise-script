(function () {
    var hotel_name = 'hotel';
    var lobby = (function () {
        var lobby_name = 'lobby';
        var reception_desk = (function () {
            var reception_desk_name = 'reception_desk';
            var guest_registry = (function () {
                var guest_registry_name = 'guest_registry';

                return {
                    feedback: '',
                    name: guest_registry_name,
                    note: '',
                    program: '',
                    usage: '',
                    children: [
                    ]
                };
            })();

            return {
                feedback: '',
                name: reception_desk_name,
                note: '',
                program: '',
                usage: '',
                children: [
                    guest_registry,
                ]
            };
        })();

        return {
            feedback: '',
            name: lobby_name,
            note: '',
            program: '',
            usage: '',
            children: [
                reception_desk,
            ]
        };
    })();

    return {
        feedback: '',
        name: hotel_name,
        note: '',
        program: '',
        usage: '',
        children: [
            lobby,
        ]
    };
})();
