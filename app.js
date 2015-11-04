/**
 * Created by Pawan on 11/4/2015.
 */

var config=require('config');
var restify = require('restify');
var socketio = require('socket.io');
var redisManager=require('./RedisManager.js');
var port = config.Host.port || 3000;
var version=config.Host.version;
var hpath=config.Host.hostpath;
var uuid=require('node-uuid');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var validator=require('validator');
var TTL=config.TTL.ttl;

var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
});

var request = require('request');

var io = socketio.listen(RestServer.server);

restify.CORS.ALLOW_HEADERS.push('authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
var Clients=new Array();
var Refs=new Array();
//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);

});

RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());



io.sockets.on('connection', function (socket) {


    var clientID = socket.handshake.query.myid;


    if(typeof Clients[clientID] === 'undefined')
    {
        // does not exist\
        Clients[clientID]=socket;
        console.log("New client registering ");
        console.log("new user registered : user id -" + socket.handshake.query.myid);
        console.log("User added : Client - "+clientID+" Socket - "+Clients[clientID].id);
    }
    else
    {
        // does exist
        Clients[clientID]=socket;
        console.log("Recorded client");
        console.log("User registeration Updated: user id -" + socket.handshake.query.myid);
        console.log("User updated : Client - "+clientID+" Socket - "+Clients[clientID].id);


    }




    socket.on('reply',function(data)
    {
        console.log("Reply received from client ");
        var clientTopic=data.Tkey;
        console.log("Token key from Client "+clientTopic);
        redisManager.ResourceObjectPicker(clientID,clientTopic,TTL,function(errGet,resGet)
        {
            if(errGet)
            {
                console.log("Searching key Error "+errGet);
            }
            else
            {
                if(resGet=="STATELESS")
                {
                    console.log("Resource object found "+resGet + " No reply expected");
                }
                else
                {
                    console.log("Resource object found "+resGet);
                    var replyObj={
                        Reply:data,
                        Ref:Refs[clientTopic]
                    };

                    console.log("Reply to sender .... "+JSON.stringify(replyObj));

                    var optionsX = {url: resGet, method: "POST", json: replyObj};
                    request(optionsX, function (errorX, responseX, dataX) {

                        if(errorX)
                        {
                            console.log("ERROR "+errorX);
                        }

                        else if (!errorX && responseX != undefined ) {

                            //logger.debug('[DVP-HTTPProgrammingAPIDEBUG] - [%s] - [SOCKET] - Socket Disconnection request sends successfully   ',JSON.stringify(responseX.body));
                            // socket.send(responseX.body);
                            console.log("Sent "+data+" To "+resGet);


                        }
                        else
                        {
                            console.log("Nooooooo");
                        }
                    });
                }


            }
        })


    });
    socket.on('disconnect',function(reason)
    {
        console.log("Disconnected "+socket.id+" Reason "+reason);


    });

});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/initiate',function(req,res,next)
{
    console.log("New request form "+req.body.From);
    var clientID=req.body.To;

    if(!isNaN(req.body.Timeout))
    {
        TTL =req.body.Timeout;
        console.log("TTL found "+TTL);
    }
    if(Clients[clientID])
    {
        var socket=Clients[clientID];
       // if(Clients[clientID]=="CONNECTED")
       // {
            console.log("Destination available");
            try
            {
                var topicID=TopicIdGenerator();
                var direction=req.body.Direction;
                var callbackURL="";
                var message=req.body.Message;
                var ref=req.body.Ref;
                Refs[topicID]=ref;
                if(direction=="STATEFUL")
                {
                    var callbackURL=req.body.Callback;
                }
                var sender = req.body.From;



            }
            catch(ex)
            {
                console.log("Error in request body "+ex);
                res.end("Error in request body "+ex);
            }


            redisManager.TokenObjectCreater(topicID,clientID,direction,sender,callbackURL,TTL,function(errTobj,resTobj)
            {
                if(errTobj)
                {
                    console.log("Error in TokenObject creation "+errTobj);
                    res.end("Error in TokenObject creation "+errTobj);
                }
                else
                {

                    redisManager.ResourceObjectCreator(clientID,topicID,TTL,function(errSet,resSet)
                    {
                        if(errSet)
                        {
                            console.log("Resource object creation failed "+errSet);
                            res.end("Resource object creation failed "+errSet);
                        }
                        else
                        {
                            console.log("Resource object creation Succeeded "+resSet);
                            var msgObj={

                                "Message":message,
                                "TopicKey":topicID
                            };
                            socket.emit('message',msgObj);
                            res.end(topicID);

                        }

                    });

                }
            });

       // }
        //else
       // {
            //console.log("No registered user found "+clientID);
            //res.end("No registered user found "+clientID);
       // }
    }
    else
    {
        console.log("Destination user not found");
        res.status(400);
        res.end("No user found "+clientID);
    }





});

TopicIdGenerator = function ()
{

    var topicID=uuid.v1();
    console.log("Token Key generated "+topicID);
    return topicID;


};