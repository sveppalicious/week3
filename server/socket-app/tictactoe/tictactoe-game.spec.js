let should = require('should');
let _ = require('lodash');

let TictactoeState = require('./tictactoe-state')(inject({}));
let tictactoe = require('./tictactoe-game')(inject({
    TictactoeState
}));

let createEvent = {
    type: "GameCreated",
    user: {
        userName: "Gulli"
    },
    name: "TheFirstGame",
    timeStamp: "2014-12-02T11:29:29"
};

let joinEvent = {
    type: "GameJoined",
    user: {
        userName: "Gummi"
    },
    name: "TheFirstGame",
    timeStamp: "2014-12-02T11:29:29"
};

function moveEvent(coordinates, side) {
    return {
        type: "MovePlaced",
        user: {
            userName: "Gummi"
        },
        name: "TheFirstGame",
        timeStamp: "2014-12-02T11:29:29",
        move: {
            xy: {x: coordinates[0], y: coordinates[1]},
            side: side
        }
    };
}


describe('create game command', function () {


    let given, when, then;

    beforeEach(function () {
        given = undefined;
        when = undefined;
        then = undefined;
    });

    afterEach(function () {
        tictactoe(given).executeCommand(when, function (actualEvents) {
            should(JSON.stringify(actualEvents)).be.exactly(JSON.stringify(then));
        });
    });


    it('should emit game created event', function () {

        given = [];
        when =
            {
                id: "123987",
                type: "CreateGame",
                user: {
                    userName: "Gulli"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            };
        then = [
            {
                type: "GameCreated",
                user: {
                    userName: "Gulli"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                side: 'X'
            }
        ];

    })
});


describe('join game command', function () {


    let given, when, then;

    beforeEach(function () {
        given = undefined;
        when = undefined;
        then = undefined;
    });

    afterEach(function () {
        tictactoe(given).executeCommand(when, function (actualEvents) {
            should(JSON.stringify(actualEvents)).be.exactly(JSON.stringify(then));
        });
    });


    it('should emit game joined event', function () {

        given = [{
            type: "GameCreated",
            user: {
                userName: "Gulli"
            },
            name: "TheFirstGame",
            timeStamp: "2014-12-02T11:29:29"
        }
        ];
        when =
            {
                type: "JoinGame",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            };
        then = [
            {
                type: "GameJoined",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                side: 'O'
            }
        ];

    });

    it('should emit FullGameJoinAttempted event when game full', function () {

        given = [{
            type: "GameCreated",
            user: {
                userName: "Gulli"
            },
            name: "TheFirstGame",
            timeStamp: "2014-12-02T11:29:29"
        },
            {
                type: "GameJoined",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            }

        ];
        when =
            {
                type: "JoinGame",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            };
        then = [
            {
                type: "FullGameJoinAttempted",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            }

        ];
    });
});

describe('leave game command', function () {


    let given, when, then;

    beforeEach(function () {
        given = undefined;
        when = undefined;
        then = undefined;
    });

    afterEach(function () {
        let executed=false;
        tictactoe(given).executeCommand(when, function (actualEvents) {
            should(JSON.stringify(actualEvents)).be.exactly(JSON.stringify(then));
            executed=true;
        });
        should(executed).be.exactly(true);
    });


    it('should emit game left event', function () {

        given = [
            {
                type: "GameCreated",
                user: {
                    userName: "Gulli"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            },
            {
                type: "GameJoined",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                side: 'O'
            }
        ];
        when =
            {
                type: "LeaveGame",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            };
        then = [
            {
                type: "GameLeft",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            }
        ];

    });

});


/* jshint ignore:start */

describe('place move command', function () {

    let given, when, then;

    beforeEach(function () {
        given = undefined;
        when = undefined;
        then = undefined;
    });

    afterEach(function () {
        tictactoe(given).executeCommand(when, function (actualEvents, moreEvents) {
            if (moreEvents) {
                return;
            }
            should(JSON.stringify(actualEvents)).be.exactly(JSON.stringify(then));
        });
    });

    it('should emit MovePlaced on first game move', function () {

        given = [
            createEvent, joinEvent
        ];
        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 0, y: 0},
                    side: 'X'
                }
            };
        then = [
            moveEvent([0, 0], 'X')
        ];
    });

    it('should emit IllegalMove when square is already occupied.', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 0], 'X')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 0, y: 0},
                    side: 'X'
                }
            };
        then = [
            {
                type: "IllegalMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 0, y: 0},
                    side: 'X'
                }
            }
        ];

    });

    it('should emit IllegalMove when center move is illegal.', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 2], 'X')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 0, y: 2},
                    side: 'X'
                }
            };
        then = [
            {
                type: "IllegalMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 0, y: 2},
                    side: 'X'
                }
            }
        ];
    });


    it('Should emit game won on top line fill', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 0], 'X'),
            moveEvent([0, 1], 'X'),
            moveEvent([1, 1], 'O')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 0, y: 2},
                    side: 'X'
                }
            };
        then = [
            moveEvent([0, 2], 'X'),
            {
                type: "GameWon",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 0, y: 2},
                    side: 'X'
                }
            }
        ];

    });

    it('Should emit game won on diagonal line fill', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 0], 'X'),
            moveEvent([1, 1], 'X'),
            moveEvent([0, 1], 'O')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'X'
                }
            };
        then = [
            moveEvent([2, 2], 'X'),
            {
                type: "GameWon",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'X'
                }

            }
        ];

    });

    it('Should emit game won on vertical line fill', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 0], 'O'),
            moveEvent([1, 1], 'O'),
            moveEvent([0, 1], 'X')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'O'
                }
            };
        then = [
            moveEvent([2, 2], 'O'),
            {
                type: "GameWon",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'O'
                }
            }
        ];

    });


    it('Should not emit game draw if won on last move.', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 0], 'X'),
            moveEvent([0, 1], 'O'),
            moveEvent([0, 2], 'O'),

            moveEvent([1, 0], 'O'),
            moveEvent([1, 1], 'O'),
            moveEvent([1, 2], 'X'),

            moveEvent([2, 0], 'X'),
            moveEvent([2, 2], 'X')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 1},
                    side: 'O'
                }
            };
        then = [
            moveEvent([2, 1], 'O'),
            {
                type: "GameWon",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 1},
                    side: 'O'
                }
            }
        ];

    });

    it('Should emit game draw when neither wins', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 0], 'X'),
            moveEvent([0, 1], 'O'),
            moveEvent([0, 2], 'O'),
            moveEvent([1, 0], 'O'),
            moveEvent([1, 1], 'O'),
            moveEvent([1, 2], 'X'),
            moveEvent([2, 0], 'X'),
            moveEvent([2, 1], 'X')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'O'
                }
            };
        then = [
            moveEvent([2, 2], 'O'),
            {
                type: "GameDraw",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29"
            }
        ];
    });

    it('Should emit NotYourMove if attempting to make move out of turn', function () {
        given = [
            createEvent,
            joinEvent,
            moveEvent([0, 0], 'X')
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'X'
                }
            };
        then = [
            {
                type: "NotYourMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'X'
                }
            }
        ];

    });

    it('Should emit game not started if both sides not joined', function () {
        given = [
            createEvent
        ];

        when =
            {
                type: "PlaceMove",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'X'
                }
            };
        then = [
            {
                type: "GameNotStarted",
                user: {
                    userName: "Gummi"
                },
                name: "TheFirstGame",
                timeStamp: "2014-12-02T11:29:29",
                move: {
                    xy: {x: 2, y: 2},
                    side: 'X'
                }
            }
        ];

    })
});
/* jshint ignore:end */
