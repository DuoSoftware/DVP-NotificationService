/**
 * Created by Pawan on 10/1/2015.
 */
var config=require('config');

var restify = require('restify');
var socketio = require('socket.io');

var redisManager=require('./RedisManager.js');


var port = 8081;//config.Host.port || 3000;
var version=config.Host.version;
var hpath=config.Host.hostpath;

var uuid=require('node-uuid');

var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
});

var io = socketio.listen(RestServer.server);

restify.CORS.ALLOW_HEADERS.push('authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());

//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);


    // SetDays();

});

RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

var Clients=new Array();

io.sockets.on('connection', function (socket) {

    console.log("new user registered : "+socket.id+" user id -" + socket.handshake.query.myid);
    var ClientID=socket.handshake.query.myid;
    Clients[ClientID]= socket;
    console.log("User added : Client - "+ClientID+" Socket - "+Clients[ClientID].id);



    //socket.emit('userID',null);

    /*socket.on('user',function(data)
    {
       console.log(data);
        if(data)
        {
            console.log("User id "+data);
            Clients[data]= socket;
            console.log("User added "+Clients[data].id);
        }
        else
        {
            console.log("Error No data")
        }
    });
    */


   /* {
       console.log("Socket id is "+data);
    });
    */



    socket.on('disconnect', function(){

        console.log("Disconnected "+socket.id);
        //res.end('disconnected');

    });

    socket.on('reply',function(data)
    {
       console.log("Reply : - "+data+" of "+socket.id);
    });



});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/initiate',function(req,res,next)
{
    var ClientID=req.body.To;
    var Direction=req.body.Direction;
    var Tkey=TopicIdGenerator();
    var Message=req.body.message;

    var socket=GetSocketData(ClientID);
    if(socket)
    {
        console.log("Socket found....");
        //socket.emit('message',Message);
        redisManager.SocketObjectManager(Tkey,socket.id,ClientID,Direction,'user001',function(errRedis,resRedis)
        {
            if(errRedis)
            {
                console.log("Error redis");
                res.end(false);
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
               /* socket.on('reply',function(data)
                {
                    //res.send(data);
                    //console.log(data);
                    res.end()
                });
                /*socket.on('disconnect', function(){

                 console.log("Disconnected "+socket.id);
                 res.end('disconnected');

                 });
                 */

            }

        });
    }
    else
    {
        //console.log("No SocketFound");
        res.end(false);
    }










});


RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/push',function(req,res,next)
{
    var ClientID='';
    //var Direction=req.body.Direction;
    var Tkey=req.body.TokenKey;
    var Message=req.body.message;

    redisManager.SocketFinder(Tkey,function(errRedis,resRedis)
    {
        if(errRedis)
        {
            console.log("Error in finding socket");
res.end(errRedis);
        }
        else
        {

            console.log(resRedis[1]);
            ClientID=resRedis[1];
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
    next();





});




/*io.on('connection', function (socket) {

 socket.on('Identity',function(ID)
 {

 redisManager.SocketObjectManager(socket.id,ID,function(errRds,resRds)
 {
 if(errRds)
 {

 }
 else
 {

 }
 });

 var userObj={
 SocketID:socket.id,
 ClientID:ID,
 Socket:socket

 };

 console.log(ID);

 Clients.push(userObj);


 });








 });
 */
GetSocketData = function (clientID) {

    console.log("Hit get socket" +Clients[clientID].id );
    return Clients[clientID];

};
/*
 RestServer.post('/push', function (req, res, next) {

 var cli = GetSocketData('cli001');



 cli.socket.push(socket.id);

 cli.socket.on('reply',function(data)
 {
 res.end(data);
 });


 var mObj=req.body;

 if(mObj.direction == "single")
 {
 socket.emit('message',mObj.message)
 }
 else
 {
 socket.emit('message',mObj.message);
 socket.on('relpy',function(data)
 {
 res.send(data);
 })
 }


 // res.end();

 });*/
TopicIdGenerator = function ()
{

    var topicID=uuid.v1();
    return topicID;


};


module.exports.GetSocketData = GetSocketData;