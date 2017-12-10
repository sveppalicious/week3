
module.exports = function(injected){
    let TictactoeState = injected('TictactoeState');

    return function(history){

        let gameState = TictactoeState(history);

        return {
            executeCommand: function(cmd, eventHandler){
                function applyEvents(events, moreEvents){
                    gameState.processEvents(events);

                    if(gameState.gameWon()){
                        events.push({
                                gameId: cmd.gameId,
                                type: "GameWon",
                                user: cmd.user,
                                name: cmd.name,
                                timeStamp: cmd.timeStamp,
                                move:cmd.move
                            });
                    }

                    if(gameState.gameDraw()){
                        events.push({
                                gameId: cmd.gameId,
                                type: "GameDraw",
                                user: cmd.user,
                                name: cmd.name,
                                timeStamp: cmd.timeStamp
                            })
                    }

                    eventHandler(events);
                }

                let cmdHandlers = {
                    "CreateGame": function (cmd) {
                        applyEvents([{
                            gameId: cmd.gameId,
                            type: "GameCreated",
                            user: cmd.user,
                            name: cmd.name,
                            timeStamp: cmd.timeStamp,
                            side:'X'
                        }]);

                    },
                    "JoinGame": function (cmd) {
                        if(gameState.gameFull()){
                            applyEvents( [{
                                gameId: cmd.gameId,
                                type: "FullGameJoinAttempted",
                                user: cmd.user,
                                name: cmd.name,
                                timeStamp: cmd.timeStamp
                            }]);
                            return;
                        }

                        applyEvents([{
                            gameId: cmd.gameId,
                            type: "GameJoined",
                            user: cmd.user,
                            name: cmd.name,
                            timeStamp: cmd.timeStamp,
                            side:'O'
                        }]);
                    },
                    "LeaveGame": function (cmd) {
                        applyEvents([{
                            gameId: cmd.gameId,
                            type: "GameLeft",
                            user: cmd.user,
                            name: cmd.name,
                            timeStamp: cmd.timeStamp
                        }]);
                    },
                    "PlaceMove": function(cmd){

                        if(!gameState.gameStarted()){
                            applyEvents([{
                                gameId: cmd.gameId,
                                type:"GameNotStarted",
                                user: cmd.user,
                                name:cmd.name,
                                timeStamp:cmd.timeStamp,
                                move: cmd.move
                            }]);
                            return;
                        }

                        if(gameState.occupied(cmd.move.xy))
                        {
                            applyEvents([{
                                gameId: cmd.gameId,
                                type:"IllegalMove",
                                user: cmd.user,
                                name:cmd.name,
                                timeStamp:cmd.timeStamp,
                                move: cmd.move
                            }]);
                            return;
                        }
                        if(!gameState.isMyMove(cmd.move.side))
                        {
                            applyEvents([{
                                gameId: cmd.gameId,
                                type:"NotYourMove",
                                user: cmd.user,
                                name:cmd.name,
                                timeStamp:cmd.timeStamp,
                                move: cmd.move
                            }]);
                            return;
                        }


                        applyEvents([{
                            gameId: cmd.gameId,
                            type: "MovePlaced",
                            user: cmd.user,
                            name: cmd.name,
                            timeStamp: cmd.timeStamp,
                            move: cmd.move
                        }]);

                    },
                    "RequestGameHistory": function(cmd){
                        // Game does not handle this command, is declared here for making tests more robust.
                    }
                };

                if(!cmdHandlers[cmd.type]){
//                    return ;
                    throw new Error("I do not handle command of type " + cmd.type)
                }
                cmdHandlers[cmd.type](cmd);
            }
        }
    }
};

