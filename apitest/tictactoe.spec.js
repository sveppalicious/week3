const io = require('socket.io-client');
const RoutingContext = require('../client/src/routing-context');
let TestAPI = require('./fluentapi/test-api');

const testAPI = TestAPI(inject({
    io,
    RoutingContext
}));

const playGame = require('./tictactoe-game-player').playGame;


describe('Tictactoe API', function () {
    beforeEach(function (done) {
        let testapi = testAPI();
        testapi.waitForCleanDatabase().cleanDatabase().then(()=> {
            testapi.disconnect();
            done();
        });
    });

    it('should be able to play one game to end', function (done) {
        playGame(done);
    });

});

