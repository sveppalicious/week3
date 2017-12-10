const fs = require('fs');

module.exports=function(injected){


    const io = injected('io');
    const RoutingContext = injected('RoutingContext');

    const incomingEventLogFile="./test-api-incoming-events.log";
    const outgoingCommandLogFile="./test-api-outgoing-commands.log";

    let connectCount =0;

    function testAPI(){
        let waitingFor=[];
        let commandId=0;

        let routingContext = RoutingContext(inject({
            io,
            env:"test",
            incomingEventLogger: function(verb, message){
                fs.appendFile(incomingEventLogFile,verb + " - " + JSON.stringify(message) + "\n", function(err){
                    if(err){
                        console.error("Error writing to log file " + incomingEventLogFile + "Error:\n" + err);
                    }
                });
            },
            outgoingCommandLogger: function(verb, message){
                fs.appendFile(outgoingCommandLogFile,verb + " - " + JSON.stringify(message) + "\n", function(err){
                    if(err){
                        console.error("Error writing to log file " + outgoingCommandLogFile + "Error:\n" + err);
                    }
                });
            }
        }));

        connectCount++;
        const me = {
            // Assignment: Trace this call - back and forth - through the code.
            // Put in log statements that enable you to trace the messages going back and forth.
            // Result is a list of modules/functions in this source code which get invoked when cleanDatabase is called.
            cleanDatabase:()=>{
                let cmdId = commandId++;
                routingContext.commandRouter.routeMessage({commandId:cmdId, type:"cleanDatabase"});
                return me;

            },
            waitForCleanDatabase:(whenClean)=>{
                waitingFor.push("expectDatabaseCleaned");
                routingContext.eventRouter.on('databaseCleaned', function(chatMessage){
                    waitingFor.pop(); // expectDatabaseCleaned
                    whenClean && whenClean();
                });
                return me;

            },
            then:(whenDoneWaiting)=>{
                function waitLonger(){
                    if(waitingFor.length>0){
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
            }

        };
        return me;
    }

    return testAPI;
};
