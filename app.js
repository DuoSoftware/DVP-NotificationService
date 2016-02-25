/**
 * Created by Pawan on 11/4/2015.
 */

var config=require('config');
var restify = require('restify');
var socketio = require('socket.io');
var redisManager=require('./RedisManager.js');
var port = config.Host.port || 3000;
var version=config.Host.version;
var uuid = require('node-uuid');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var validator = require('validator');
var TTL = config.TTL.ttl;
var MyID = config.ID;
var DbConn = require('dvp-dbmodels');
var httpReq = require('request');
var validator = require('validator');
var request = require('request');
var util = require('util');
var DBController = require('./DBController.js');




var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
});

var io = socketio.listen(RestServer.server);

restify.CORS.ALLOW_HEADERS.push('authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());

var Clients ={};//=new Array();
var Refs=new Array();

//Server listen

RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);

    // Reset server data
    redisManager.ResetServerData(MyID, function (errReset,resReset) {

        if(errReset)
        {
            console.log("Error occurred on resetting",errReset);
        }
        else
        {
            console.log(resReset);
            console.log("Server resets successfully");
        }
    });

});

RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());



io.sockets.on('connection', function (socket) {

    var QueuedMessagesSt=false;

//get client's identity
    var clientID = socket.handshake.query.myid;
    console.log(clientID);

    redisManager.CheckClientAvailability(clientID,function (errAvbl,resAvbl) {

        if(errAvbl)
        {
            console.log("Exception found in Checking client availability ",errAvbl);
        }
        else
        {
            if(!resAvbl)
            {
                console.log("Client name is already taken");
            }
            else
            {
                if(!Clients[clientID])
                {
                    // does not exist\
                    Clients[clientID]=socket;


                    redisManager.RecordUserServer(clientID,MyID, function (errSet,resSet) {
                        if(errSet)
                        {
                            console.log("Error in Client registration , Check your redis connection");
                        }
                        else
                        {
                            //console.log(JSON.stringify(Clients));
                            console.log("New client registering ");
                            console.log("new user registered : user id -" + socket.handshake.query.myid);
                            console.log("User added : Client - "+clientID+" Socket - "+Clients[clientID].id);
                        }
                    });

                }
                else
                {
                    // does exist
                    Clients[clientID]=socket;

                    console.log("Recorded client");
                    console.log("User registeration Updated: user id -" + socket.handshake.query.myid);
                    console.log("User updated : Client - "+clientID+" Socket - "+Clients[clientID].id);


                }
            }
        }
    });


    socket.on('reply',function(data)
    {
        console.log("Reply received from client ");
        console.log("Message : "+data.Message);
        var clientTopic=data.Tkey;

        console.log("Token key from Client "+clientTopic);

        /* redisManager.ResourceObjectPicker(clientID,clientTopic,TTL,function(errGet,resGet)
         {
         console.log(resGet);
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
         });*/

        redisManager.ResponseUrlPicker(clientTopic,TTL, function (errURL,resURL) {

            if(errURL)
            {
                console.log("Error in searching URL ",errURL);
            }
            else
            {
                if(!resURL || resURL==null || resURL=="")
                {
                    console.log("Invalid URL records found ",resURL)
                }
                else
                {
                    var direction = resURL[0];
                    var URL =resURL[1];

                    if(direction=="STATELESS" )
                    {

                    }
                    else
                    {
                        if(direction=="STATEFUL" && URL!=null)
                        {
                            var replyObj={
                                Reply:data,
                                Ref:Refs[clientTopic]
                            };

                            console.log("Reply to sender .... "+JSON.stringify(replyObj));

                            var optionsX = {url: URL, method: "POST", json: replyObj};
                            request(optionsX, function (errorX, responseX, dataX) {

                                if(errorX)
                                {
                                    console.log("ERROR "+errorX);
                                }

                                else if (!errorX && responseX != undefined ) {

                                    console.log("Sent "+data+" To "+URL);

                                }
                                else
                                {
                                    console.log("Nooooooo");
                                }
                            });
                        }
                        else
                        {
                            console.log("Invalid Callback URL found "+resURL);
                        }
                    }

                }
            }
        });


    });
    socket.on('disconnect',function(reason)
    {
        console.log("Disconnected "+socket.id+" Reason "+reason);
        console.log("Socket ID ",socket.id);
        console.log("ClientID "+socket.handshake.query.myid);
        var ClientID=socket.handshake.query.myid;

        redisManager.ClientLocationDataRemover(ClientID,MyID, function (e,r) {
            if(e)
            {
                console.log("error "+e);
                delete Clients[ClientID];
                //  res.end();
            }
            else
            {
                console.log("res "+r);
                delete Clients[ClientID];

                //res.end();
            }
        });


    });

});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/initiate',function(req,res,next)
{
    console.log("New request form "+req.body.From);
    var clientID=req.body.To;

    redisManager.CheckClientAvailability(clientID, function (errAvbl,resAvbl) {

        console.log("Checking result "+resAvbl);
        if(resAvbl && req.body.Persistency)
        {
            console.log("Client is not available.......................");
            if(errAvbl)
            {
                console.log("Error in Checking Availability ",errAvbl);

            }


            DBController.PersistenceMessageRecorder(req, function (errSave,resSave) {

                if(errSave)
                {
                    console.log("Error in Message Saving ",errSave);
                    res.end();
                }
                else
                {
                    console.log("Message saving succeeded ",resSave);
                    res.end();
                }
            });
        }
        else
        {
            if(!isNaN(req.body.Timeout))
            {
                TTL =req.body.Timeout;
                console.log("TTL found "+TTL);
            }
            console.log(clientID);

            if(Clients[clientID])
            {

                var socket=Clients[clientID];

                console.log("Destination available");
                try
                {
                    var callbackURL="";
                    var topicID=TopicIdGenerator();
                    var direction=req.body.Direction;
                    var callbackURL="";
                    var message=req.body.Message;
                    var ref=req.body.Ref;

                    Refs[topicID]=ref;

                    if(direction=="STATEFUL")
                    {
                        callbackURL=req.body.Callback;
                    }
                    var sender = req.body.From;



                }
                catch(ex)
                {
                    console.log("Error in request body "+ex);
                    res.end("Error in request body "+ex);
                }


                redisManager.TokenObjectCreator(topicID,clientID,direction,sender,callbackURL,TTL,function(errTobj,resTobj)
                {
                    if(errTobj)
                    {
                        console.log("Error in TokenObject creation "+errTobj);
                        res.end("Error in TokenObject creation "+errTobj);
                    }
                    else
                    {

                        /*redisManager.ResourceObjectCreator(clientID,topicID,TTL,function(errSet,resSet)
                         {
                         if(errSet)
                         {
                         console.log("Resource object creation failed "+errSet);
                         res.end("Resource object creation failed "+errSet);
                         }
                         else
                         {
                         console.log("Resource object creation Succeeded "+resSet);*/
                        var msgObj={

                            "Message":message,
                            "TopicKey":topicID
                        };
                        socket.emit('message',msgObj);
                        res.end(topicID);

                        /*    }

                         });*/

                    }
                });

            }
            else
            {
                redisManager.GetClientsServer(clientID, function (errGet,resGet) {

                    if(errGet)
                    {
                        console.log("error in getting client server");
                        console.log("Destination user not found");
                        res.status(400);
                        res.end("No user found "+clientID);
                    }
                    else
                    {
                        console.log("SERVER "+resGet);
                        console.log("My ID "+MyID);
                        DBController.ServerPicker(resGet, function (errPick,resPick) {

                            if(errPick)
                            {
                                console.log("error in Picking server from DB");
                                console.log("Destination user not found");
                                console.log("error "+errPick);
                                res.status(400);
                                res.end("No user found "+clientID);
                            }
                            else
                            {
                                var ServerIP = resPick.URL;
                                console.log(ServerIP);


                                var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/initiate', ServerIP, version);
                                var options = {
                                    url : httpUrl,
                                    method : 'POST',
                                    json : req.body

                                };

                                console.log(options);
                                try
                                {
                                    httpReq(options, function (error, response, body)
                                    {
                                        if (!error && response.statusCode == 200)
                                        {
                                            console.log("no errrs");
                                            res.end();
                                        }
                                        else
                                        {
                                            console.log("errrs  "+error);
                                            res.end();
                                        }
                                    });
                                }
                                catch(ex)
                                {
                                    console.log("ex..."+ex);
                                    res.end();
                                }

                            }
                        });
                    }
                });
            }
        }

    });

    return next();

});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/Continue/:Topic',function(req,res,next)
{
    //console.log("New request form "+req.body.From);
    /*
     var topicID=req.body.topicID;
     var sender = req.body.From;





     if(!isNaN(req.body.Timeout))
     {
     TTL =req.body.Timeout;
     console.log("TTL found "+TTL);
     }
     console.log(clientID);

     if(Clients[clientID]) {

     var socket=Clients[clientID];




     }
     else
     {
     redisManager.GetClientsServer(clientID, function (errGet,resGet) {

     if(errGet)
     {
     console.log("error in getting client server");
     console.log("Destination user not found");
     res.status(400);
     res.end("No user found "+clientID);
     }
     else
     {
     console.log("SERVER "+resGet);
     console.log("My ID "+MyID);
     ServerPicker(resGet, function (errPick,resPick) {

     if(errPick)
     {
     console.log("error in Picking server from DB");
     console.log("Destination user not found");
     console.log("error "+errPick);
     res.status(400);
     res.end("No user found "+clientID);
     }
     else
     {
     var ServerIP = resPick.URL;
     console.log(ServerIP);


     var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/initiate', ServerIP, version);
     var options = {
     url : httpUrl,
     method : 'POST',
     json : req.body

     };

     console.log(options);
     try
     {
     httpReq(options, function (error, response, body)
     {
     if (!error && response.statusCode == 200)
     {
     console.log("no errrs");
     res.end();
     }
     else
     {
     console.log("errrs  "+error);
     res.end();
     }
     });
     }
     catch(ex)
     {
     console.log("ex..."+ex);
     res.end();
     }

     }
     });
     }
     });
     }

     */
    var Obj = req.body;
    var message= Obj.Message;
    var topicKey = req.params.Topic;
    var Persistency = req.body.Persistency;



    redisManager.TopicObjectPicker(topicKey,TTL, function (e,r) {

        if(e)
        {
            console.log(e);
            res.end();
        }
        else
        {
            if(r==null || r=="")
            {
                console.log("Invalid or Expired Token given, Please try from initial step");
                res.end("Invalid key");
            }
            else
            {
                // console.log("Got token Data "+r);
                redisManager.CheckClientAvailability(r.Client, function (errAvbl,resAvbl) {

                    console.log("Checking result "+resAvbl);

                    if(resAvbl && Persistency)
                    {
                        console.log("Client is not available.......................");
                        if(errAvbl)
                        {
                            console.log("Error in Checking Availability ",errAvbl);

                        }


                        DBController.PersistenceMessageRecorder(req, function (errSave,resSave) {

                            if(errSave)
                            {
                                console.log("Error in Message Saving ",errSave);
                                res.end();
                            }
                            else
                            {
                                console.log("Message saving succeeded ",resSave);
                                res.end();
                            }
                        });
                    }
                    else
                    {
                        if(Clients[r.Client])
                        {
                            var socket= Clients[r.Client];
                            var msgObj={

                                "Message":message,
                                "TopicKey":topicKey
                            };
                            socket.emit('message',msgObj);
                            res.end(r.Client);
                        }
                        else
                        {
                            redisManager.GetClientsServer(r.Client, function (errGet,resGet) {

                                if(errGet)
                                {
                                    console.log("error in getting client server");
                                    console.log("Destination user not found");
                                    res.status(400);
                                    res.end("No user found "+r.Client);
                                }
                                else
                                {
                                    console.log("SERVER "+resGet);
                                    console.log("My ID "+MyID);
                                    DBController.ServerPicker(resGet, function (errPick,resPick) {

                                        if(errPick)
                                        {
                                            console.log("error in Picking server from DB");
                                            console.log("Destination user not found");
                                            console.log("error "+errPick);
                                            res.status(400);
                                            res.end("No user found "+clientID);
                                        }
                                        else
                                        {
                                            var ServerIP = resPick.URL;
                                            console.log(ServerIP);


                                            var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Continue/'+req.params.Topic, ServerIP, version);
                                            var options = {
                                                url : httpUrl,
                                                method : 'POST',
                                                json : req.body

                                            };

                                            console.log(options);
                                            try
                                            {
                                                httpReq(options, function (error, response, body)
                                                {
                                                    if (!error && response.statusCode == 200)
                                                    {
                                                        console.log("no errrs");
                                                        res.end();
                                                    }
                                                    else
                                                    {
                                                        console.log("errrs  "+error);
                                                        res.end();
                                                    }
                                                });
                                            }
                                            catch(ex)
                                            {
                                                console.log("ex..."+ex);
                                                res.end();
                                            }

                                        }
                                    });
                                }
                            });
                        }
                    }


                });


            }

        }

    });


    return next();
});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/DisconnectSession/:Topic',function(req,res,next)
{
    var topicKey = req.params.Topic;

    redisManager.TopicObjectPicker(topicKey,TTL, function (errTopic,resTopic) {

        if(errTopic)
        {
            console.log(errTopic);
            res.end();
        }
        else
        {
            if(resTopic=="" || resTopic==null)
            {
                console.log("Invalid or Expired Session");
                res.end();
            }
            else
            {
                if(Clients[resTopic.Client])
                {
                    redisManager.SessionRemover(topicKey, function (errRem,resRem) {
                        if(errRem)
                        {
                            console.log(errRem);
                            res.end();
                        }
                        else
                        {
                            if(resRem==null || !resRem || resRem=="")
                            {

                                console.log("Invalid or Expired Session ");
                                res.end();
                            }
                            else
                            {
                                console.log(resRem);
                                console.log("Session Removed Successfully");
                                res.end();
                            }

                        }
                    });
                }
                else
                {
                    redisManager.GetClientsServer(resTopic.Client, function (errGet,resGet) {

                        if(errGet)
                        {
                            console.log("error in getting client server");
                            console.log("Destination user not found");
                            res.status(400);
                            res.end("No user found "+resTopic.Client);
                        }
                        else
                        {
                            console.log("SERVER "+resGet);
                            console.log("My ID "+MyID);
                            DBController.ServerPicker(resGet, function (errPick,resPick) {

                                if(errPick)
                                {
                                    console.log("error in Picking server from DB");
                                    console.log("Destination user not found");
                                    console.log("error "+errPick);
                                    res.status(400);
                                    res.end("No user found "+clientID);
                                }
                                else
                                {
                                    var ServerIP = resPick.URL;
                                    console.log(ServerIP);


                                    var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/DisconnectSession/'+resTopic.Client, ServerIP, version);
                                    var options = {
                                        url : httpUrl,
                                        method : 'POST',
                                        json : req.body

                                    };

                                    console.log(options);
                                    try
                                    {
                                        httpReq(options, function (error, response, body)
                                        {
                                            if (!error && response.statusCode == 200)
                                            {
                                                console.log("no errrs");
                                                res.end();
                                            }
                                            else
                                            {
                                                console.log("errrs  "+error);
                                                res.end();
                                            }
                                        });
                                    }
                                    catch(ex)
                                    {
                                        console.log("ex..."+ex);
                                        res.end();
                                    }

                                }
                            });
                        }
                    });
                }
            }
        }
    });
    return next();
});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/test',function(req,res,next)
{
    var array={};
    array["a"]=1;
    array["b"]=2;
    array["c"]=3;
    array["d"]=4;
    array["e"]=5;
    array["f"]=6;

    //console.log(array["c"]);
    console.log(array["f"]);
    delete array["d"];
    console.log(array);
    res.end();




    return next();
});


TopicIdGenerator = function ()
{

    var topicID=uuid.v1();
    console.log("Token Key generated "+topicID);
    return topicID;


};

/*
 ServerPicker = function (SID,callback) {

 DbConn.NotificationServer.find({where:{id:SID}}).then(function (resServ) {

 if(resServ)
 {
 callback(undefined,resServ) ;
 }
 else
 {
 callback(new Error("Invalid ID"),undefined);
 }
 }).catch(function (errServ)
 {
 console.log(errServ);
 callback(errServ,undefined);
 });
 };

 PersistenceMessageRecorder = function (Obj,callback) {

 var CallbackObj = {

 Timeout:Obj.Timeout,
 Message:Obj.Message,
 Ref:Obj.Ref,
 Direction:Obj.Direction
 };
 try {
 var newMessageObject = DbConn.PersistenceMessages
 .build(
 {
 From : Obj.From,
 To : Obj.To,
 Time : Date.now(),
 Callback:JSON.stringify(CallbackObj)

 }
 )
 }
 catch (e)
 {
 callback(e,undefined);
 }

 newMessageObject.save().then(function (resSave) {
 callback(undefined,resSave)
 }).catch(function (errSave) {
 callback(errSave,undefined);
 });
 };

 QueuedMessagesPicker = function (clientID,callback) {

 DbConn.PersistenceMessages.findall({where:[{To:clientID}]}).then(function (resMessages) {
 callback(undefined,resMessages);
 }).catch(function (errMessages) {
 callback(errMessages,undefined);
 })

 };*/
