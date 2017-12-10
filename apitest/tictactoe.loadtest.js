const io = require('socket.io-client');
const fs = require('fs');
const RoutingContext = require('../client/src/routing-context');
const _ = require('lodash');

const UserAPI = require('./fluentapi/user-api');
const TestAPI = require('./fluentapi/test-api');

const playGame = require('./tictactoe-game-player').playGame;

const userAPI = UserAPI(inject({
    io,
    RoutingContext
}));

const testAPI = TestAPI(inject({
    io,
    RoutingContext
}));



describe('Tictactoe load test', function () {


    /* Assignment: Find appropriate numbers to configure the load test so it passes on your buildserver
    * under normal load. */
    let timelimit = 1000;
    let count = 1000;

    beforeEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = timelimit;
        fs.existsSync("./user-api-incoming-events.log") && fs.unlinkSync('./user-api-incoming-events.log');
        fs.existsSync("./user-api-outgoing-commands.log") && fs.unlinkSync('./user-api-outgoing-commands.log');

        let testapi = testAPI();

        testapi.waitForCleanDatabase().cleanDatabase().then(() => {
            testapi.disconnect();
            done();
        });
    });

    // This is a helper function which assists in analysing inconsistent game
    // state between players, which can easily arise if there are timing/order
    // issues in the test sequence.
    function compareIncompleteGameEvents(incompleteGames, allGames) {
        _.each(incompleteGames, function (incompleteGame) {
            let opposingPlayerGame = _.find(allGames, (game) => {
                return game.gameId === incompleteGame.gameId && game.side !== incompleteGame.side
            });
            if (opposingPlayerGame) {

                console.log("opposingPlayerGame keys")
                _.forIn(opposingPlayerGame.receivedMessages, (msg, key) => {
                    console.log(key)
                });
                console.log("opposingPlayerGame keys")

                console.log("incompleteGame keys")
                _.forIn(incompleteGame.receivedMessages, (msg, key) => {
                    console.log(key)
                });
                console.log("incompleteGame keys")

                _.each(opposingPlayerGame.receivedMessages, (message, messageKey) => {
                    if (message.type === "GameCreated") return;
                    if (!incompleteGame.receivedMessages.hasOwnProperty(messageKey)) {
                        console.log("Opposing player game has message which incomplete game does not", messageKey);
                        console.log(JSON.stringify(message));
                    }
                });

                _.each(incompleteGame.receivedMessages, (message, msgKey) => {
                    if (message.type === "GameCreated") return;
                    if (!opposingPlayerGame.receivedMessages.hasOwnProperty(msgKey)) {
                        console.log("Incomplete player game has message which opposing game does not", msgKey);
                        console.log(JSON.stringify(message));
                    }
                })
            }
        })
    }

    afterEach(function () {
        _.each(userAPI.getAllWaits(), function (wait) {
            wait.printWait();
        });
        let incompleteGames = userAPI.getIncompleteGames();

        if (incompleteGames.length > 0) {
            // console.debug("Incomplete game count", incompleteGames.length);
            compareIncompleteGameEvents(incompleteGames, userAPI.allGames);
        }
    });

    it('should be able to play ' + count + ' games to end within timelimit of ' + timelimit + 'ms', function (done) {
        let incomplete = 0;
        for (let i = 0; i < count; i++) {
            incomplete++;
            playGame(() => {
                incomplete--;
                if (incomplete <= 0) {
                    done();
                }
            });
        }
    });
});

