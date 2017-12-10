const io = require('socket.io-client');
const RoutingContext = require('../client/src/routing-context');
let UserAPI = require('./fluentapi/user-api');
let TestAPI = require('./fluentapi/test-api');

const userAPI = UserAPI(inject({
    io,
    RoutingContext
}));


const testAPI = TestAPI(inject({
    io,
    RoutingContext
}));


describe('User chat load test', function(){


    let timelimit = 10000;

    beforeEach(function(done){
        jasmine.DEFAULT_TIMEOUT_INTERVAL = timelimit;
        let testapi = testAPI();
        testapi.waitForCleanDatabase().cleanDatabase().then(()=>{
            testapi.disconnect();
            done();
        });
    });

    const count = 200;

    it('should connect and send ' + count + '  user messages within '+ timelimit +'ms',function(done){

        let startMillis = new Date().getTime();

        let user;
        let users=[];
        for(let i=0; i<count; i++){
            user = userAPI.create("User#" + i);
            users.push(user);
            user.sendChatMessage('Message ' + i);
        }

        user = userAPI.create("Final user");
        user.expectChatMessageReceived('TWO')
            .sendChatMessage('TWO')
            .then(function(){
                user.disconnect();
                _.each(users, function(usr){
                    usr.disconnect();
                });

                let endMillis = new Date().getTime();
                let duration = endMillis - startMillis;
                if(duration > timelimit){

                    console.error(duration + " exceeds limit " + timelimit)
                }
                done();
            });
    });
});


