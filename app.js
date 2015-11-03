/**
 * Created by Pawan on 10/1/2015.
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

//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);

});

RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

var Clients=new Array();
var Refs=new Array();
var Sessions= new Array();

io.sockets.on('connection', function (socket) {


    var ClientID=socket.handshake.query.myid;

    if(Clients[ClientID])
    {
console.log("Client is in DB");
        var tkn=Sessions[Clients[ClientID].id];
        SocketObjectUpdater(tkn,socket.id,function(errupdt,resupdt)
        {
            if(errupdt)
            {
                console.log("New socket data recording failed "+errupdt);
            }
            else
            {
                console.log("User registeration Updated: "+socket.id+" user id -" + socket.handshake.query.myid);
                console.log("User updated : Client - "+ClientID+" Socket - "+Clients[ClientID].id);
                console.log("New socket data recording succeeded "+resupdt);
            }
        })
    }
    else
    {
        console.log("new user registered : "+socket.id+" user id -" + socket.handshake.query.myid);
        console.log("User added : Client - "+ClientID+" Socket - "+Clients[ClientID].id);
        Clients[ClientID]= socket;
    }




    socket.on('disconnect', function(reason){

        console.log("Disconnected "+socket.id+" Reason "+reason);

        if(reason=='client namespace disconnect')
        {
            console.log("Client side disconnection.. waiting to reconnect ....")
        }
        else
        {
            var Tkey=Sessions[socket.id];
            if(Tkey)
            {
                redisManager.SocketStateChanger(Tkey,"Disconnected",TTL,function(errSession,resSession)
                {
                    if(errSession)
                    {
                        console.log("State update failed of Topic key "+Tkey);
                    }
                    else
                    {
                        var ReplyObj={
                            Reply:"Session disconnected ",
                            Ref:Refs[Tkey]
                        };
                        console.log("Replies .... "+JSON.stringify(ReplyObj));
                        var optionsX = {url: resSession, method: "POST", json: ReplyObj};
                        request(optionsX, function (errorX, responseX, dataX) {

                            if(errorX)
                            {
                                console.log("ERROR "+errorX);
                            }
                            else if (!errorX && responseX != undefined )
                            {
                                console.log("Sent  To "+resSession);
                            }
                            else
                            {
                                console.log("Nooooooo");
                            }
                        });
                    }

                });
            }else
            {
                console.log("Session disconnected in early stages. Reason : "+reason);
            }
        }






    });

    socket.on('reply',function(data)
    {


        console.log("Reply is coming");
        var TK=data.Tkey;
        console.log(TK);
        console.log(data.Message);
        redisManager.SocketFinder(TK,TTL,function(errRedis,resRedis)
        {
            if(errRedis)
            {
                console.log("ERR "+errRedis);
            }
            else
            {
                console.log(resRedis);
                var URL=resRedis[3];//"http://192.168.0.15:2226/DVP/DialerAPI/ResumeCallback";//
                console.log(URL);

                var ReplyObj={
                    Reply:data,
                    Ref:Refs[TK]
                };
                console.log("Replies .... "+JSON.stringify(ReplyObj));
                var optionsX = {url: URL, method: "POST", json: ReplyObj};
                request(optionsX, function (errorX, responseX, dataX) {

                    if(errorX)
                    {
                        console.log("ERROR "+errorX);
                    }

                    else if (!errorX && responseX != undefined ) {

                        //logger.debug('[DVP-HTTPProgrammingAPIDEBUG] - [%s] - [SOCKET] - Socket Disconnection request sends successfully   ',JSON.stringify(responseX.body));
                        // socket.send(responseX.body);
                        console.log("Sent "+data+" To "+URL);


                    }
                    else
                    {
                        console.log("Nooooooo");
                    }
                });

            }
        });
        //console.log("Reply : - "+data+" of "+socket.id);
    });



});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/initiate',function(req,res,next)
{
    console.log("New request");
    var ClientID=req.body.To;

    if(!isNaN(req.body.Timeout))
    {
        TTL =req.body.Timeout;
        console.log("TTL found "+TTL);
    }

    if(Clients[ClientID])
    {
        console.log("Registered Client");
        var Direction=req.body.Direction;
        var Tkey=TopicIdGenerator();
        var Message=req.body.Message;
        var CallBk=req.body.Callback;
        var ref=req.body.Ref;
        var State="WAITINGFORACCEPT";
        var From=req.body.From;
        Refs[Tkey]= ref;

        var socket=GetSocketData(ClientID);

        if(socket)
        {
            console.log("Socket found....");
            Sessions[socket.id]=Tkey;
            //socket.emit('message',Message);
            redisManager.SocketObjectManager(Tkey,socket.id,ClientID,Direction,From,CallBk,State,TTL,function(errRedis,resRedis)
            {
                if(errRedis)
                {
                    console.log("Error redis");
                    res.end(errRedis);
                }
                else
                {
                    console.log("Done redis");

                    var MsgObj={

                        "Message":Message,
                        "TopicKey":Tkey
                    };
                    socket.emit('message',MsgObj);
                    res.end(Tkey);


                }

            });
        }
        else
        {
            console.log("No Socket Found");
            res.status(400);
            res.end();
        }

    }
    else
    {
        console.log("Unknown Client");
        res.status(400);
        res.end("Unknown Client");

    }


    return next();








});


RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/push',function(req,res,next)
{
    var ClientID='';
    //var Direction=req.body.Direction;
    var Tkey=req.body.TokenKey;
    var Message=req.body.message;
    Refs[Tkey]= ref;

    redisManager.SocketFinder(Tkey,function(errRedis,resRedis)
    {
        if(errRedis)
        {
            console.log("Error in finding socket");
            res.end(errRedis);
        }
        else
        {

            console.log(resRedis[0]);
            ClientID=resRedis[0];
            console.log("Socket found "+ClientID);
            var socket=GetSocketData(ClientID);
            if(socket)
            {
                console.log("Socket found....");
                socket.emit('message',Message);
                res.end("New message sent to Client : "+ClientID);
                /* socket.on('reply',function(data)
                 {
                 res.end(data);
                 });
                 */
            }
            else
            {
                console.log("No SocketFound");
                res.end("No socket");
            }

        }
    });






    return next();





});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/disconnect',function(req,res,next)
{
    var ClientID=req.body.To;
    //var Direction=req.body.Direction;
    //var Tkey=CreateTopicValue();
    // var Message=req.body.message;

    var socket=GetSocketData(ClientID);
    if(socket)
    {
        console.log("Socket found....");
        socket.emit('news',null);
        //socket.disconnect();
    }
    else
    {
        console.log("No SocketFound");
    }


    res.end();
    return next();





});





GetSocketData = function (clientID) {

    console.log("Hit get socket" +Clients[clientID].id );
    if(Clients[clientID])
    {
        console.log("Session  "+Clients[clientID]+ "Found for Client "+clientID);
        return Clients[clientID];
    }
    else
    {
        console.log("No Session  Found for Client "+clientID);
        return false;
    }


};

TopicIdGenerator = function ()
{

    var topicID=uuid.v1();
    console.log("Token Key generated "+topicID);
    return topicID;


};

CheckUserAvalability = function()
{

}

module.exports.GetSocketData = GetSocketData;