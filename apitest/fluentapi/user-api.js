module.exports=function(injected){

    const io = require('socket.io-client');
    const RoutingContext = injected('RoutingContext');
    const generateUUID = require('../../client/src/common/framework/uuid');
    const _ = require('lodash');

    let connectCount =0;

    let allWaits=[];
    let allGames=[];

    /* Assignment: Explain what the push/pop functions do for this API. What effect would it have
    on the fluent API if we did not have them?
      * */

    function create(){
        let waitingFor={
            counters: {},
            push:function(verb){
                waitingFor.counters[verb]=waitingFor.counters[verb] || [];
                waitingFor.counters[verb].push(verb);
            },
            pop:function(verb, message){
                if(!waitingFor.counters[verb]){
                    if(verb!=="GameCreated"){
                        fail("Not waiting on " + verb  + ", ERROR!" + JSON.stringify(message) + JSON.stringify(game));
                    }
                } else {
                    waitingFor.counters[verb].pop();
                }
            },
            count(){
                let count=0;
                _.forEach(waitingFor.counters, (list)=>{
                    count += list.length;
                });
                return count;
            },
            printWait(){
                _.each(waitingFor.counters, function(counter, verb){
                    if(counter.length>0){
                        console.log(game.side, ":", verb, counter.length ,JSON.stringify(game.userSession.user.userName), " GameId", game.gameId);
                    }
                })
            }
        };
        allWaits.push(waitingFor);
        let game={
            receivedMessages:{},
            sentCommands:[]
        };
        allGames.push(game);

        function popIfMyGame(eventMessage, callback){
            if(eventMessage.gameId===game.gameId){
                if(game.receivedMessages[eventMessage.eventId]){
                    console.warn("Already received message " + eventMessage.eventId, JSON.stringify(eventMessage))
                } else {
                    game.receivedMessages[eventMessage.eventId] = eventMessage;
                    waitingFor.pop(eventMessage.type, eventMessage);
                    callback && callback();
                }
            }
        }

        let routingContext = RoutingContext(inject({
            io,
            env:"test",
            fs: require('fs'),
            incomingEventLogFile : "./user-api-incoming-events.log",
            outgoingCommandLogFile : "./user-api-outgoing-commands.log"
        }));

        routingContext.eventRouter.on('GameCreated', function(eventMessage){
            popIfMyGame(eventMessage, ()=>{
                game.userSession = eventMessage.userSession;
            });
        });

        routingContext.eventRouter.on("NotYourMove",  function(eventMessage){
            fail("Move out of turn...that should not happen." + JSON.stringify(eventMessage));
        });

        routingContext.eventRouter.on('GameWon', function(eventMessage){
            popIfMyGame(eventMessage, ()=>{
                game.complete = true;
            });
        });

        routingContext.eventRouter.on('GameJoined', function(eventMessage){
            popIfMyGame(eventMessage, ()=>{
                game.userSession = eventMessage.userSession;
            });
        });

        routingContext.eventRouter.on('MovePlaced', function(eventMessage){
            popIfMyGame(eventMessage);
        });


        function routeCommand(command){
            game.sentCommands.push(command);
            routingContext.commandRouter.routeMessage(command);
        }


        connectCount++;
        const me = {
            expectUserAck:(cb)=>{
                waitingFor.push("sessionAck");
                routingContext.socket.on('sessionAck', function(ackMessage){
                    expect(ackMessage.clientId).not.toBeUndefined();
                    waitingFor.pop("sessionAck");
                });
                return me;
            },
            sendChatMessage:(message)=>{
                let cmdId = generateUUID();
                routeCommand({commandId:cmdId, type:"chatCommand", message });
                return me;
            },
            expectChatMessageReceived:(message)=>{
                waitingFor.push("chatMessageReceived");
                routingContext.eventRouter.on('chatMessageReceived', function(chatMessage){
                    expect(chatMessage.sender).not.toBeUndefined();
                    if(chatMessage.message===message){
                        waitingFor.pop("chatMessageReceived");
                    }
                });
                return me;
            },

            createGame:()=>{
                let cmdId = generateUUID();
                game.gameId= generateUUID();
                routeCommand({commandId:cmdId, type:"CreateGame", gameId: game.gameId });
                game.side='X';

                return me;
            },
            getGame:()=>{
                return game
            },
            joinGame:(gameId)=>{
                let cmdId = generateUUID();
                game.gameId=gameId;
                routeCommand({commandId:cmdId, type:"JoinGame", gameId:game.gameId});
                game.side='O';
                return me;
            },

            placeMove:(x, y)=>{
                let cmdId = generateUUID();
                routeCommand(
                    {
                        commandId:cmdId,
                        type:"PlaceMove",
                        gameId:game.gameId,
                        move: {
                            xy: {x: x, y: y},
                            side: game.side
                        }

                    });
                return me;
            },
            expectGameWon:()=>{
                waitingFor.push("GameWon");
                return me;
            },
            expectGameCreated:()=>{
                waitingFor.push("GameCreated");
                return me;
            },
            expectGameJoined:()=>{
                waitingFor.push("GameJoined");
                return me;
            },
            expectMoveMade:()=>{
                waitingFor.push("MovePlaced");
                return me;
            },
            then:(whenDoneWaiting)=>{
                function waitLonger(){
                    if(waitingFor.count()>0){
                        setTimeout(waitLonger, 0);
                        return;
                    }
                    whenDoneWaiting();
                }
                waitLonger();
                return me;
            },
            disconnect:function(){
                routingContext.socket.disconnect();
            },
        };
        return me;
    }

    return {
        create:create,
        getAllWaits: function(){
            return allWaits;
        },
        getIncompleteGames(){
            return _.filter(allGames, (game)=>{return !game.complete && game.gameId});
        },
        allGames:allGames
    };
};
