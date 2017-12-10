const io = require('socket.io-client');
const RoutingContext = require('../client/src/routing-context');

let UserAPI = require('./fluentapi/user-api');

const userAPI = UserAPI(inject({
    io,
    RoutingContext
}));


function playGame(done) {

    let userA = userAPI.create();
    let userB = userAPI.create();

    let gamesDone = {};

    function gameDone(side) {
        gamesDone[side] = true;
        if (gamesDone['X'] && gamesDone['O']) {
            done();
        }
    }

    /*
    Assignment: Explain how this apparently sequential code can function to play *two* sides
    of the game.
    */
    function playOSide() {

        /*
        Assignment: Run load tests. See them succeed a couple of times.
                    Move expectMoveMade() and expectGameJoined() after joinGame() call, and expectGameCreated() after createGame() call
                    like this:
                         userB.joinGame(userA.getGame().gameId).expectMoveMade('X').expectGameJoined().then(function () {


                     Run load tests again. They should fail. Explain why they fail.
         */
        userB.expectGameJoined().expectMoveMade('X').joinGame(userA.getGame().gameId).then(function () {
            userB.expectMoveMade('O').expectMoveMade('X').placeMove(1, 0).then(() => {
                userB.expectMoveMade('O').expectMoveMade('X').expectGameWon().placeMove(0, 2).then(() => {
                    userB.disconnect();
                    gameDone("O");
                })
            })
        })
    }

    userA.expectGameCreated().createGame().then(() => {
        playOSide();
        userA.expectGameJoined().then(() => {
            userA.expectMoveMade('X').expectMoveMade('O').placeMove(0, 0).then(() => {   //  A
                userA.expectMoveMade('X').expectMoveMade('O').placeMove(1, 1).then(() => {   // A
                    userA.expectMoveMade('X').expectGameWon().placeMove(2, 2).then(function () {
                        userA.disconnect();
                        gameDone("X");
                    }); // Winning move
                })
            })
        })
    })
}

module.exports= {
    playGame: playGame
};