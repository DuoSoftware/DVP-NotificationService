/**
 * Created by Pawan on 11/4/2015.
 */

var config=require('config');
var restify = require('restify');
var socketio = require('socket.io');
var DbConn = require('dvp-dbmodels');
var httpReq = require('request');
var util = require('util');
var uuid = require('node-uuid');
var async= require('async');


var port = config.Host.port || 3000;
var version=config.Host.version;
var token=config.Token;

var redisManager=require('./RedisManager.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DBController = require('./DBController.js');

var TTL = config.TTL.ttl;
var MyID = config.ID;


var secret = require('dvp-common/Authentication/Secret.js');
var socketioJwt =  require("socketio-jwt");
var jwt = require('restify-jwt');
var authorization = require('dvp-common/Authentication/Authorization.js');



var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
});

var io = socketio.listen(RestServer.server);
restify.CORS.ALLOW_HEADERS.push('authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

restify.CORS.ALLOW_HEADERS.push('authorization');
RestServer.use(jwt({secret: secret.Secret}));

var Clients ={};//=new Array();
var Refs=new Array();



//Server listen

RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);
    redisManager.LocationListPicker("aps", function (e,r) {

        if(typeof r !== 'undefined' && r.length > 0)
        {
            console.log(r);
            if(r.indexOf(MyID)==-1)
            {
                console.log("new");
            }
            else
            {
                console.log("new Instance");
            }
        }
        else
        {
            console.log("Empty");
        }
    });

});





io.sockets.on('connection',socketioJwt.authorize({
    secret:  secret.Secret,
    timeout: 15000 // 15 seconds to send the authentication message
})).on('authenticated',function (socket) {

    console.log('authenticated received ');
    var clientID = socket.decoded_token.client;
    socket.emit('clientdetails',clientID);
    console.log(clientID);

//get client's identity

    if(clientID)
    {
        console.log('authenticated Client :- '+clientID);

        if(Clients[clientID])
        {
            console.log("New Instance");
            var curSockArray=[];
            curSockArray=Clients[clientID];
            curSockArray.push(socket);
            Clients[clientID]= curSockArray;
        }
        else
        {
            console.log("new Client");
            var curSockArray=[];
            curSockArray.push(socket);
            Clients[clientID]=curSockArray;

        }



        redisManager.LocationListPicker(clientID, function (errList,resList) {

            if(errList)
            {
                console.log("Error in Checking Register status of "+clientID,errList);
            }
            else
            {


                if(typeof resList !== 'undefined' && resList.length > 0)
                {

                    // console.log("New Client instance Added");
                    if(resList.indexOf(MyID)==-1)
                    {
                        console.log("New user for This server");
                        redisManager.RecordUserServer(clientID,MyID, function (errSet,resSet) {
                            if(errSet)
                            {
                                console.log("Error in Client registration, Client : "+clientID+" Error : "+errSet);
                            }
                            else
                            {

                                console.log("New Client Registered : "+clientID);

                                /*DBController.QueuedMessagesPicker(clientID, function (errMsg,resMsg) {

                                 if(errMsg)
                                 {
                                 console.log("Error in queued messages searching for Client : "+clientID,errMsg);
                                 }
                                 else
                                 {
                                 console.log(resMsg.length+" Messages found for Client : "+clientID);
                                 for(i=0 ;i<resMsg.length;i++)
                                 {
                                 QueuedMessageOperator(resMsg[i]);
                                 }





                                 }
                                 });*/
                            }
                        });
                    }
                    else
                    {
                        console.log("New user instance for This server");

                    }
                }
                else
                {

                    console.log("New user for This server for first time");

                    redisManager.RecordUserServer(clientID,MyID, function (errSet,resSet) {
                        if(errSet)
                        {
                            console.log("Error in Client registration, Client : "+clientID+" Error : "+errSet);
                        }
                        else
                        {

                            console.log("New Client Registered FirstTime : "+clientID);

                            /*DBController.QueuedMessagesPicker(clientID, function (errMsg,resMsg) {

                             if(errMsg)
                             {
                             console.log("Error in queued messages searching for Client : "+clientID,errMsg);
                             }
                             else
                             {
                             console.log(resMsg.length+" Messages found for Client : "+clientID);
                             for(i=0 ;i<resMsg.length;i++)
                             {
                             QueuedMessageOperator(resMsg[i]);
                             }





                             }
                             });*/
                        }
                    });


                }

                DBController.QueuedMessagesPicker(clientID, function (errMsg,resMsg) {

                    if(errMsg)
                    {
                        console.log("Error in queued messages searching for Client : "+clientID,errMsg);
                    }
                    else
                    {
                        console.log(resMsg.length+" Messages found for Client : "+clientID);
                        for(i=0 ;i<resMsg.length;i++)
                        {
                            QueuedMessageOperator(resMsg[i],socket);
                        }


                    }
                });


                /*
                 else
                 {

                 console.log("KEY "+dataKey);
                 var serverID = dataKey.split(":")[3];
                 console.log("Server ID "+serverID);
                 if(serverID==MyID)
                 {
                 console.log("Registered Client on This server Client : "+clientID);

                 Clients[clientID]=socket;

                 DBController.QueuedMessagesPicker(clientID, function (errMsg,resMsg)
                 {

                 if(errMsg)
                 {
                 console.log("Error in queued messages searching for Client : "+clientID,errMsg);
                 }
                 else
                 {

                 for(var i=0 ;i<resMsg.length;i++)
                 {

                 QueuedMessageOperator(resMsg[i]);

                 }




                 }
                 });
                 }
                 else
                 {
                 console.log("Not registered client in this server");

                 DBController.ServerPicker(serverID, function (errPick,resPick) {

                 if(errPick)
                 {
                 console.log("Error in Searching Server IP "+errPick);
                 }
                 else
                 {
                 console.log("Server record found  "+JSON.stringify(resPick));
                 var URL="http://"+resPick.URL+"/DVP/API/"+version+"/NotificationService/Notification/Server/"+serverID+"/Availability";
                 console.log(URL);
                 var optionsX = {url: URL, method: "GET"};
                 httpReq(optionsX, function (errorX, responseX, dataX) {


                 if(errorX )
                 {
                 console.log("ERROR in searching server location "+errorX);

                 redisManager.UserServerUpdater(clientID,serverID,MyID,function (errRecord,resRecord)
                 {
                 if(errRecord)
                 {
                 console.log("Error in client data : "+clientID+" saving with server : "+serverID,errRecord);
                 }
                 else
                 {
                 Clients[clientID]=socket;
                 console.log("Client registered to Server ID : "+MyID);

                 DBController.QueuedMessagesPicker(clientID, function (errMsg,resMsg) {

                 if(errMsg)
                 {
                 console.log("Error in queued messages searching for Client : "+clientID,errMsg);
                 }
                 else
                 {
                 for(var i=0 ;i<resMsg.length;i++)
                 {
                 QueuedMessageOperator(resMsg[i]);
                 }

                 }
                 });



                 }

                 });

                 }

                 else if (!errorX && responseX.statusCode  == 200 ) {


                 console.log("Client is already registered in another Active server, Try with another client");

                 }
                 else
                 {
                 redisManager.RecordUserServer(clientID,serverID, function (errRecord,resRecord) {

                 if(errRecord)
                 {
                 console.log("Error in client data : "+clientID+" saving with server : "+serverID,errRecord);
                 }
                 else
                 {
                 Clients[clientID]=socket;
                 console.log("Client registered successfully "+clientID);

                 DBController.QueuedMessagesPicker(clientID, function (errMsg,resMsg) {

                 if(errMsg)
                 {
                 console.log("Error in queued messages searching for Client : "+clientID,errMsg);
                 }
                 else
                 {

                 console.log(resMsg.length+" Messages found ");
                 for(var i=0 ;i<resMsg.length;i++)
                 {
                 QueuedMessageOperator(resMsg[i]);
                 }

                 }
                 });
                 }

                 });
                 }
                 });
                 }

                 });
                 }

                 }
                 */
            }

        });
    }

    socket.on('reply',function(data)
    {
        console.log("Reply received from client ");
        console.log("Message : "+data.Message);
        var clientTopic=data.Tkey;

        console.log("Token key from Client "+clientTopic);


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

                    console.log("URL "+URL);
                    console.log("DIRECTION "+direction);

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
                            httpReq(optionsX, function (errorX, responseX, dataX) {

                                if(errorX)
                                {
                                    console.log("ERROR sending request "+errorX);
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
    { var ClientID=socket.decoded_token.client;
        console.log("Disconnected "+socket.id+" Reason "+reason);
        console.log("Socket ID ",socket.id);
        console.log("ClientID "+ClientID);

        if(typeof Clients[ClientID] !== 'undefined' && Clients[ClientID].length >1)
        {

            var index = Clients[ClientID].indexOf(socket);
            Clients[ClientID].splice(index, 1);
            //delete Clients[ClientID][Clients[ClientID].indexOf(socket)];
            console.log("Client Id instance disconnected ",socket.id);
        }
        else
        {
            redisManager.ClientLocationDataRemover(ClientID,MyID, function (e,r) {

                var index = Clients[ClientID].indexOf(socket);
                Clients[ClientID].splice(index, 1);
                if(e)
                {
                    console.log("Error in Client Location removing "+e);

                    console.log("Client Id instance disconnected from server ",socket.id);
                    //  res.end();
                }
                else
                {
                    console.log("Client Location removed "+r);
                    console.log("Client Id instance disconnected ",socket.id);

                    //res.end();
                }
            });
        }



    });

    socket.on('subscribe', function (subsObj) {

        InitiateSubscriber(clientID,subsObj, function (errSubs,resSubs) {

            if(errSubs)
            {
                console.log("Error in subscribing Client : "+clientID+" Error : "+errSubs);
            }
            else
            {
                console.log("Successfully Subscribed, Key : "+resSubs);
            }
        });
    });

});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/initiate',authorization({resource:"notification", action:"write"}),function(req,res,next)
{

    /*var clientID=req.body.To;
     var eventName=req.headers.eventname;
     var eventUuid=req.headers.eventuuid;
     var msgSenderArray=[];
     var Company =1;
     var Tenant=1;

     redisManager.LocationListPicker(clientID, function (errList,resList) {

     console.log("Checking Location result "+resList);
     if(errList)
     {
     console.log("Client is not available.......................");
     console.log("Error in Checking Availability ",errList);
     res.end();

     }

     else
     {
     if(typeof resList !== 'undefined' && resList.length > 0)
     {
     if(!isNaN(req.body.Timeout))
     {
     TTL =req.body.Timeout;
     console.log("TTL found "+TTL);
     }

     var callbackURL=req.body.CallbackURL;
     var topicID=TopicIdGenerator();
     var direction=req.body.Direction;
     var message=req.body.Message;
     var ref=req.body.Ref;

     Refs[topicID]=ref;

     if(direction=="STATEFUL")
     {
     callbackURL=req.body.CallbackURL;
     }
     var sender = req.body.From;


     var msgObj={

     "Message":message,
     "TopicKey":topicID,
     "eventName":eventName,
     "eventUuid":eventUuid,
     "Company":Company,
     "Tenant":Tenant

     };



     redisManager.TokenObjectCreator(topicID,clientID,direction,sender,callbackURL,TTL,function(errTobj,resTobj)
     {
     resList.forEach(function (serverId) {

     console.log("hit");
     msgSenderArray.push(function createContact(callback)
     {
     if(serverId==MyID)
     {
     if(Clients[clientID])
     {
     var insArray =Clients[clientID];
     for(var i=0;i<insArray.length;i++)
     {
     var insSocket=insArray[i];


     if(eventName=="agent_connected")
     {
     insSocket.emit('agent_connected',msgObj);
     console.log("Event notification sent : "+JSON.stringify(msgObj));
     }
     else if(eventName=="agent_disconnected")
     {
     insSocket.emit('agent_disconnected',msgObj);
     console.log("Event notification sent : "+JSON.stringify(msgObj));
     }
     else if(eventName=="agent_found") {
     insSocket.emit('agent_found',msgObj);
     console.log("Event notification sent : "+JSON.stringify(msgObj));
     }
     else
     {
     insSocket.emit('message',msgObj);
     console.log("Message sent : "+JSON.stringify(msgObj));
     }

     if(i==insArray.length-1)
     {
     //res.end();
     callback(undefined,"Success");
     }
     }

     }
     }
     else
     {
     DBController.ServerPicker(serverId, function (errServ,resServ) {
     if(errServ)
     {
     console.log("Error in server picking");
     callback(errServ,undefined);
     }
     else if(!resServ)
     {
     console.log("Invalid server ID");
     callback(new Error("Invalid Server ID"),undefined);
     }
     else
     {
     var ServerIP = resServ.URL;
     console.log(ServerIP);


     var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/initiate/fromRemoteserver', ServerIP, version);
     var options = {
     url : httpUrl,
     method : 'POST',
     json : req.body,
     headers:{
     'eventName':req.headers.eventname,
     'eventUuid':req.headers.eventuuid,
     'authorization':'bearer '+token,
     'topic':topicID
     }

     };


     httpReq(options, function (error, response, body)
     {
     if (!error && response.statusCode == 200)
     {
     console.log("no errrs");
     console.log(JSON.stringify(response));
     callback(undefined,"Success")
     }
     else
     {
     console.log("errrs  "+error);
     callback(error,undefined);
     }
     });
     }
     });
     }


     });



     });
     async.parallel(msgSenderArray, function (errBulkSend,resSend) {

     console.log(errBulkSend);
     console.log(resSend);
     if(errTobj)
     {
     res.end(new Error("Topic key delievering Error "+errTobj));
     }
     else
     {
     res.end(topicID);
     }

     });

     });



     }
     else
     {
     if(req.body.Persistency)
     {

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
     console.log("Client is not available.......................");
     res.end();
     }

     }



     ///////////////////////////////////////////////////////////////////////////////////

     /!*if(resAvbl && req.body.Persistency)
     {

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
     console.log("Client "+clientID+" is registered in this server");
     var socket=Clients[clientID];

     console.log("Destination available");
     console.log("Body "+req.body);
     try
     {
     var callbackURL=req.body.CallbackURL;
     var topicID=TopicIdGenerator();
     var direction=req.body.Direction;
     var message=req.body.Message;
     var ref=req.body.Ref;

     Refs[topicID]=ref;

     if(direction=="STATEFUL")
     {
     callbackURL=req.body.CallbackURL;
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


     var msgObj={

     "Message":message,
     "TopicKey":topicID,
     "eventName":eventName,
     "eventUuid":eventUuid,
     "Company":Company,
     "Tenant":Tenant

     };
     if(eventName=="agent_connected")
     {
     socket.emit('agent_connected',msgObj);
     console.log("Event notification sent : "+JSON.stringify(msgObj));
     }
     else if(eventName=="agent_disconnected")
     {
     socket.emit('agent_disconnected',msgObj);
     console.log("Event notification sent : "+JSON.stringify(msgObj));
     }
     else if(eventName=="agent_found") {
     socket.emit('agent_found',msgObj);
     console.log("Event notification sent : "+JSON.stringify(msgObj));
     }
     else
     {
     socket.emit('message',msgObj);
     console.log("Message sent : "+JSON.stringify(msgObj));
     }

     res.end(topicID);

     }
     });

     }
     else
     {
     console.log("Client "+clientID+" is not registered in this server");
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
     console.log(JSON.stringify(response));
     res.end(response.body);
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
     }*!/
     }


     });*/

    console.log("New request form "+req.body.From);

    var clientID=req.body.To;
    var eventName=req.headers.eventname;
    var eventUuid=req.headers.eventuuid;
    var msgSenderArray=[];



    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;



    redisManager.LocationListPicker(clientID, function (errList,resList) {

        console.log("Checking Availability of Client :  "+clientID);

        if(errList)
        {
            console.log("Client is not available.......................");
            console.log("Error in Checking Availability ",errList);
            res.end();
        }
        else if(typeof resList !== 'undefined' && resList.length > 0)
        {
            if(!isNaN(req.body.Timeout))
            {
                TTL =req.body.Timeout;
                console.log("TTL found "+TTL);
            }

            var callbackURL=req.body.CallbackURL;
            var topicID=TopicIdGenerator();
            var direction=req.body.Direction;
            var message=req.body.Message;
            var ref=req.body.Ref;

            Refs[topicID]=ref;

            if(direction=="STATEFUL")
            {
                callbackURL=req.body.CallbackURL;
            }
            var sender = req.body.From;


            var msgObj={

                "Message":message,
                "TopicKey":topicID,
                "eventName":eventName,
                "eventUuid":eventUuid,
                "Company":Company,
                "Tenant":Tenant

            };

            redisManager.TokenObjectCreator(topicID,clientID,direction,sender,callbackURL,TTL,function(errTobj,resTobj)
            {
                resList.forEach(function (serverId) {

                    console.log("hit");
                    msgSenderArray.push(function createContact(callback)
                    {
                        if(serverId==MyID)
                        {
                            if(Clients[clientID])
                            {
                                var insArray =Clients[clientID];
                                for(var i=0;i<insArray.length;i++)
                                {
                                    var insSocket=insArray[i];


                                    if(eventName=="agent_connected")
                                    {
                                        insSocket.emit('agent_connected',msgObj);
                                        console.log("Event notification sent : "+JSON.stringify(msgObj));
                                    }
                                    else if(eventName=="agent_disconnected")
                                    {
                                        insSocket.emit('agent_disconnected',msgObj);
                                        console.log("Event notification sent : "+JSON.stringify(msgObj));
                                    }
                                    else if(eventName=="agent_found") {
                                        insSocket.emit('agent_found',msgObj);
                                        console.log("Event notification sent : "+JSON.stringify(msgObj));
                                    }
                                    else
                                    {
                                        insSocket.emit('message',msgObj);
                                        console.log("Message sent : "+JSON.stringify(msgObj));
                                    }

                                    if(i==insArray.length-1)
                                    {
                                        //res.end();
                                        callback(undefined,"Success");
                                    }
                                }

                            }
                        }
                        else
                        {
                            DBController.ServerPicker(serverId, function (errServ,resServ) {
                                if(errServ)
                                {
                                    console.log("Error in server picking");
                                    callback(errServ,undefined);
                                }
                                else if(!resServ)
                                {
                                    console.log("Invalid server ID");
                                    callback(new Error("Invalid Server ID"),undefined);
                                }
                                else
                                {
                                    var ServerIP = resServ.URL;
                                    console.log(ServerIP);


                                    var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/initiate/fromRemoteserver', ServerIP, version);
                                    var options = {
                                        url : httpUrl,
                                        method : 'POST',
                                        json : req.body,
                                        headers:{
                                            'eventName':req.headers.eventname,
                                            'eventUuid':req.headers.eventuuid,
                                            'authorization':'bearer '+token,
                                            'topic':topicID
                                        }

                                    };


                                    httpReq(options, function (error, response, body)
                                    {
                                        if (!error && response.statusCode == 200)
                                        {
                                            console.log("no errrs");
                                            console.log(JSON.stringify(response));
                                            callback(undefined,"Success")
                                        }
                                        else
                                        {
                                            console.log("errrs  "+error);
                                            callback(error,undefined);
                                        }
                                    });
                                }
                            });
                        }


                    });



                });
                async.parallel(msgSenderArray, function (errBulkSend,resSend) {

                    console.log(errBulkSend);
                    console.log(resSend);
                    if(errTobj)
                    {
                        res.end(new Error("Topic key delievering Error "+errTobj));
                    }
                    else
                    {
                        res.end(topicID);
                    }

                });

            });






        }
        else
        {
            console.log("No client found.....................");
            if(req.body.Persistency)
            {
                console.log("No client found,  backing up messages ");

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
                console.log("No client found, Operation ends without backing up messages");
                res.end();
            }

        }
    });



    return next();

});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/Continue/:Topic',authorization({resource:"notification", action:"write"}),function(req,res,next)
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

    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;



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


                                            var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/Continue/'+req.params.Topic, ServerIP, version);
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
                                                    console.log("error "+error);
                                                    console.log("response "+response.statusCode);
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

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/DisconnectSession/:Topic',authorization({resource:"notification", action:"write"}),function(req,res,next)
{
    var topicKey = req.params.Topic;
    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;

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

RestServer.get('/DVP/API/'+version+'/NotificationService/Notification/Server/:id/Availability',authorization({resource:"notification", action:"read"}),function(req,res,next)
{
    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;

    res.status(200);
    res.end(true);

    return next();
});


RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/Broadcast',authorization({resource:"notification", action:"write"}),function(req,res,next)
{
    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;

    var clientData = req.body.Clients;


    console.log(clientData);
    var clientCount=clientData.length;

    for(var i=0;i<clientData.length;i++)
    {
        console.log("......................................................"+clientData[i].name+"........................................................................................................................")
        BroadcastMessageHandler(req.body,clientData[i].name, function (errBCMsg,resBCMsg)
        {
            if(i==clientCount)
            {
                console.log("Request ended");
                res.end();
            }
            if(errBCMsg)
            {
                console.log("err "+errBCMsg);
                //res.end();

            }
            else
            {
                console.log("res "+resBCMsg);
                //res.end();

            }

        });


    }
    return next();
});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/Broadcast/:userName',authorization({resource:"notification", action:"write"}),function(req,res,next)
{
    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;

    var user = req.params.userName;
    var userData = req.body;

    if(Clients[user])
    {
        var socket=Clients[user];
        var BcMsgObj={

            "Message":userData.Message
        };
        socket.emit('broadcast',BcMsgObj);
        res.end();
        //callback(undefined,user);

    }
    else
    {
        console.log("Not in clientList "+clientData);
        userData.To=user;
        DBController.PersistenceGroupMessageRecorder(userData, function (errSave,resSave)
        {
            if(errSave)
            {
                //callback(errSave,undefined);
                console.log("DB error "+errSave);
                res.end();
            }
            else
            {
                //callback(undefined,resSave);
                console.log("DB kk "+resSave);
                res.end(resSave);
            }

        });
    }
});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/Subscribe/:username',authorization({resource:"notification", action:"write"}),function(req,res,next)
{
    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;

    var userID= req.params.username;

    redisManager.IsRegisteredClient(userID, function (errReg,status,resReg) {

        if(errReg)
        {
            console.log("Error in client registration checking "+errReg);
            res.end();
        }
        else
        {
            if(resReg && status)
            {
                var key = "Query:" + uuid.v1();

                redisManager.QuerySubscriberRecorder(key,userID, function (errSubs,resSubs) {

                    if(errSubs)
                    {
                        console.log("Subcriber record saving error "+errSubs);
                        res.end();
                    }
                    else
                    {
                        if(!resSubs)
                        {
                            console.log("Unable to save subs record");
                            res.end();
                        }
                        else
                        {
                            req.body.RefId=key;
                            var ServerIP="127.0.0.1:8050";
                            var httpUrl = util.format('http://%s/DVP/API/%s/CEP/ActivateQuery', ServerIP, version);
                            var msgObj=req.body;
                            // msgObj.callbackURL=util.format('http://%s/DVP/API/%s/NotificationService/Notification/Publish', ServerIP, version);
                            msgObj.CallbackURL="http://192.168.0.88:8080/DVP/API/6.0/NotificationService/Notification/Publish";
                            var options = {
                                url : httpUrl,
                                method : 'POST',
                                json : msgObj

                            };

                            console.log(options);
                            try
                            {
                                httpReq(options, function (error, response, body)
                                {
                                    if (!error && response.statusCode == 200)
                                    {
                                        console.log("no errrs in request 200 ok");
                                        //callback(undefined,response.statusCode);
                                        res.end(key);

                                    }
                                    else
                                    {
                                        console.log("errrs in request  "+error);
                                        res.end("Error");
                                        //callback(error,undefined);

                                    }
                                });
                            }
                            catch(ex)
                            {
                                console.log("ex..."+ex);
                                res.end("Exception");
                                //callback(ex,undefined);

                            }


                        }
                    }
                });
            }
            else
            {
                console.log("Client ID  not found  "+userID);
                res.end();
            }
        }
    });

    return next();
});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/Publish',authorization({resource:"notification", action:"write"}), function (req,res,next)
{
    try
    {
        if(!req.user.company || !req.user.tenant)
        {
            throw new Error("Invalid company or tenant");
        }

        var Company=req.user.company;
        var Tenant=req.user.tenant;

        var queryKey = req.body.refID;
        var msgObj = req.body;
        if(queryKey)
        {
            redisManager.QueryKeySubscriberPicker(queryKey, function (errSubs,resSubs) {

                if(errSubs)
                {
                    console.log(errSubs);
                    res.end();
                }
                else
                {
                    if(!resSubs)
                    {
                        console.log("No Subscribers found");
                        res.end();
                    }
                    else
                    {
                        PublishToUser(resSubs,msgObj, function (errPublish,resPublish) {

                            if(errPublish)
                            {
                                //res.end("Error");
                                console.log(errPublish);
                                res.end();

                            }
                            else
                            {
                                console.log("Success");
                                //res.end("Done");
                                res.end();
                            }
                        });

                    }
                }

            });
        }
        else
        {
            console.log("Invalid query key");
            res.end();

        }
    }
    catch (e)
    {
        console.log(e);
        res.end();
    }
    return next();

});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/Publish/:username',authorization({resource:"notification", action:"write"}), function (req,res,next) {

    console.log("HIT publish");
    if(!req.user.company || !req.user.tenant)
    {
        throw new Error("Invalid company or tenant");
    }

    var Company=req.user.company;
    var Tenant=req.user.tenant;

    var clientID=req.params.username;
    if(Clients[clientID])
    {
        console.log(clientID+" in");
        var socket=Clients[clientID];
        socket.emit('publish',req.body);
        res.end("Success");
    }
    else
    {

        DBController.PersistencePubSubMessageRecorder(req.body,clientID, function (errSave,resSave) {
            if(errSave)
            {
                console.log("Error Save "+errSave);
                res.end();
            }
            else
            {
                console.log("Success ");
                res.end();
            }
        });
    }



    return next();
});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/test', function (req,res,next){

    redisManager.SubsQueryUserAvailabitityChecker("Query:select * agents:1:3:name-saman-age-10","client1", function (e,r) {

        if(e)
        {
            console.log(e);
            res.end("error");
        }
        else
        {
            res.end("success");
        }
    })

});

RestServer.post('/DVP/API/'+version+'/NotificationService/Notification/initiate/fromRemoteserver', function (req,res,next){

    var clientID= req.body.To;
    var eventName=req.headers.eventname;
    var eventUuid=req.headers.eventuuid;
    var Company=1;
    var Tenant =1;
    var topic = req.headers.topic;

    if(!isNaN(req.body.Timeout))
    {
        TTL =req.body.Timeout;
        console.log("TTL found "+TTL);
    }

    var callbackURL=req.body.CallbackURL;
    var topicID=topic;
    var direction=req.body.Direction;
    var message=req.body.Message;
    var ref=req.body.Ref;

    Refs[topicID]=ref;

    if(direction=="STATEFUL")
    {
        callbackURL=req.body.CallbackURL;
    }
    var msgObj={

        "Message":message,
        "TopicKey":topicID,
        "eventName":eventName,
        "eventUuid":eventUuid,
        "Company":Company,
        "Tenant":Tenant

    };


    if(Clients[clientID])
    {
        var insArray =Clients[clientID];
        for(var i=0;i<insArray.length;i++)
        {
            var insSocket=insArray[i];

            if(eventName=="agent_connected")
            {
                insSocket.emit('agent_connected',msgObj);
                console.log("Event notification sent : "+JSON.stringify(msgObj));
            }
            else if(eventName=="agent_disconnected")
            {
                insSocket.emit('agent_disconnected',msgObj);
                console.log("Event notification sent : "+JSON.stringify(msgObj));
            }
            else if(eventName=="agent_found") {
                insSocket.emit('agent_found',msgObj);
                console.log("Event notification sent : "+JSON.stringify(msgObj));
            }
            else
            {
                insSocket.emit('message',msgObj);
                console.log("Message sent : "+JSON.stringify(msgObj));
            }


            if(i==insArray.length-1)
            {
                //res.end();
                callback(undefined,"Success");
            }
        }

    }
    else
    {
        if(req.body.Persistency)
        {
            DBController.PersistenceMessageRecorder(req, function (errSave,resSave) {

                if(errSave)
                {
                    console.log("Error in Message Saving ",errSave);
                    res.end();
                }
                else
                {
                    console.log("Message saving succeeded ");
                    res.end();
                }
            });
        }
        else
        {
            console.log("No clien found");
            res.end();
        }
    }

    return next();
});


TopicIdGenerator = function ()
{

    var topicID=uuid.v1();
    console.log("Token Key generated "+topicID);
    return topicID;


};

QueuedInitiateMessageSender = function (messageObj,socketObj,callback) {

    try {
        var clientID = messageObj.To;
        var Persistency = true;
        var callbackObj = JSON.parse(messageObj.Callback);
        var Timeout = callbackObj.Timeout;
        var Direction = callbackObj.Direction;
        var Message = callbackObj.Message;
        var Ref = callbackObj.Ref;
        var callbackURL = "";
        var From = messageObj.From;
        var socket;



        if (!isNaN(Timeout))
        {
            TTL = Timeout;
            console.log("TTL found " + TTL);
        }
        console.log(clientID);

        if (Clients[clientID])
        {
            socket=socketObj;
            console.log("Destination available");

            var topicID = TopicIdGenerator();
            var direction = Direction;
            callbackURL = "";
            var message = Message;
            var ref = Ref;

            Refs[topicID] = ref;

            if (direction == "STATEFUL") {
                callbackURL = callbackObj.CallbackURL;
            }
            var sender = From;


            redisManager.TokenObjectCreator(topicID, clientID, direction, sender, callbackURL, TTL, function (errTobj, resTobj) {
                if (errTobj) {
                    console.log("Error in TokenObject creation " + errTobj);
                    //res.end("Error in TokenObject creation "+errTobj);
                    callback(errTobj, undefined);
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
                    callback(undefined,topicID);
                    /*    }

                     });*/

                }
            });





        }
        else
        {
            console.log("Invalid destination")
        }





        /*redisManager.CheckClientAvailability(clientID, function (errAvbl, resAvbl) {

         console.log("Checking result " + resAvbl);
         if (resAvbl && Persistency) {
         console.log("Client is not available.......................");
         if (errAvbl)
         {
         console.log("Error in Checking Availability ", errAvbl);

         }

         }
         else {
         if (!isNaN(Timeout))
         {
         TTL = Timeout;
         console.log("TTL found " + TTL);
         }
         console.log(clientID);

         if (Clients[clientID]) {

         var socket = Clients[clientID];

         console.log("Destination available");
         try {




         }
         catch (ex) {
         console.log("Error in request body " + ex);
         callback(ex, undefined);
         }


         redisManager.TokenObjectCreator(topicID, clientID, direction, sender, callbackURL, TTL, function (errTobj, resTobj) {
         if (errTobj) {
         console.log("Error in TokenObject creation " + errTobj);
         //res.end("Error in TokenObject creation "+errTobj);
         callback(errTobj, undefined);
         }
         else
         {
         /!*redisManager.ResourceObjectCreator(clientID,topicID,TTL,function(errSet,resSet)
         {
         if(errSet)
         {
         console.log("Resource object creation failed "+errSet);
         res.end("Resource object creation failed "+errSet);
         }
         else
         {
         console.log("Resource object creation Succeeded "+resSet);*!/
         var msgObj={
         "Message":message,
         "TopicKey":topicID
         };
         socket.emit('message',msgObj);
         callback(undefined,topicID);
         /!*    }

         });*!/

         }
         });

         }
         else
         {
         callback(new Error
         ("Invlid Client data"+
         clientID),undefined);
         }
         }

         });*/

    } catch (e) {
        callback(e,undefined);
    }

};
QueuedContinueMessageSender = function (messageObj,callback) {


    try
    {
        var callbackObj = JSON.parse(messageObj);
        var message = callbackObj.Message;
        var topicKey = callbackObj.Topic;
        var Persistency = true;


        redisManager.TopicObjectPicker(topicKey, TTL, function (e, r) {

            if (e) {
                console.log(e);
                callback(e, undefined);
            }
            else {
                if (r == null || r == "") {
                    console.log("Invalid or Expired Token given, Please try from initial step");
                    callback(new Error("Invalid Topic"), undefined);
                }
                else {
                    // console.log("Got token Data "+r);
                    redisManager.CheckClientAvailability(r.Client, function (errAvbl, resAvbl) {

                        console.log("Checking result " + resAvbl);

                        if (resAvbl && Persistency) {
                            console.log("Client is not available.......................");
                            if (errAvbl) {
                                console.log("Error in Checking Availability ", errAvbl);
                                callback(errAvbl, undefined);

                            }

                        }
                        else {
                            if (Clients[r.Client]) {
                                var socket = Clients[r.Client];
                                var msgObj = {

                                    "Message": message,
                                    "TopicKey": topicKey
                                };
                                socket.emit('message', msgObj);
                                callback(undefined, topicKey);
                            }
                            else {
                                callback(new Error("Client unavailable " + r.Client), undefined);
                            }
                        }


                    });


                }

            }

        });
    }
    catch (e)
    {
        callback(e,undefined);
    }

};

QueuedMessagesPicker = function (clientID,callback) {

    DbConn.PersistenceMessages.findAll({where:{To:clientID}}).then(function (resMessages)
    {
        callback(undefined,resMessages);

    }).catch(function (errMessages)
    {
        callback(errMessages,undefined);
    });

};

QueuedMessageOperator = function (msgObj,socketObj) {

    try {
        var topicKey = JSON.parse(msgObj.Callback).Topic;
        var MessageType = JSON.parse(msgObj.Callback).MessageType;
        var msgReciever = msgObj.To;
        var msgID = msgObj.id;

        if (!topicKey)
        {
            if (MessageType == "GENERAL")
            {
                QueuedInitiateMessageSender(msgObj,socketObj, function (errInitiate, resInitiate) {
                    if (errInitiate) {
                        console.log("Error in Queued Message Sending " + errInitiate);
                    }
                    else {
                        DBController.PersistenceMessageRemover(msgID, function (errRem, resRem) {
                            if (errRem) {
                                console.log("Error in Removing Queued Message data : " + msgReciever, errRem);
                            }
                            else {
                                console.log("Queued message Sent and Removed from Queue : " + msgReciever);
                            }
                        });
                    }
                });
            }
            else
            {
                if(MessageType=="BROADCAST")
                {
                    QueuedBroadcastMessageSender(msgObj, function (errBcSend, resBcSend) {

                        if (errBcSend)
                        {
                            console.log("Error in Queued Broadcast Message sending Client :  "+ msgReciever+" Error:"+ errBcSend);
                        }
                        else
                        {
                            DBController.PersistenceMessageRemover(msgID, function (errRem, resRem) {
                                if (errRem)
                                {
                                    console.log("Error in Removing Queued Message To : " + msgReciever+" Error :"+errRem);
                                }
                                else
                                {
                                    console.log("Queued message Sent and Removed from Queue : " + msgReciever);
                                }
                            });
                        }

                    });
                }
                else
                {
                    QueuedPubSubMessageSender(msgObj, function (errPubSubSend,resPubSubSend) {

                        if(errPubSubSend)
                        {
                            console.log("Error in sending Queued Subscribe Messages to Client : "+msgReciever+" Error: "+errPubSubSend);
                        }
                        else
                        {
                            DBController.PersistenceMessageRemover(msgID, function (errRem, resRem) {
                                if (errRem)
                                {
                                    console.log("Error in Removing Queued Message To Client : " + msgReciever+"Error : "+ errRem);
                                }
                                else {
                                    console.log("Queued message Sent and Removed from Queue : " + msgReciever);
                                }
                            });
                        }

                    })
                }

            }

        }
        else
        {
            console.log("Continues Messages");

            QueuedContinueMessageSender(msgObj.Callback, function (errConMsg, resConMsg) {

                if (errConMsg)
                {
                    console.log("Error in Sending Continues Messages ", errConMsg);
                }
                else
                {
                    console.log("Continue messages sent successfully ");
                    DBController.PersistenceMessageRemover(msgID, function (errRem, resRem) {
                        if (errRem)
                        {
                            console.log("Error in Removing Queued Message data : " + msgReciever, errRem);
                        }
                        else
                        {
                            console.log("Queued message Sent and Removed from Queue : " + msgReciever);
                        }
                    });
                }

            });
        }
    } catch (e) {
        callback(e,undefined);
    }


};

BroadcastMessageHandler = function (msgObj,clientData,callback) {


    try {
        var msgBody = msgObj;
        msgBody.To = clientData;
        msgBody.Ref = "";
        msgBody.Direction = "STATELESS";
        msgBody.Topic = "";
        msgBody.Callback = "";

        console.log("Message Body " + JSON.stringify(msgBody));
        redisManager.GetClientsServer(clientData, function (errServer, resServer) {

            if (errServer) {
                console.log("Error in server searching for client " + clientData);

                msgBody.To = clientData;
                console.log("Error Client " + msgBody.To);
                console.log("my Client " + clientData);
                DBController.PersistenceGroupMessageRecorder(msgBody, function (errSave, resSave) {
                    if (errSave) {
                        callback(errSave, undefined);
                    }
                    else {
                        callback(undefined, resSave);
                    }

                });
            }
            else {
                console.log("Server " + resServer + " found for client " + clientData);

                if (MyID == resServer) {
                    console.log("Client " + clientData + " is a registerd client");
                    if (Clients[clientData]) {
                        var socket = Clients[clientData];
                        var BcMsgObj = {

                            "Message": msgObj.Message
                        };
                        socket.emit('broadcast', BcMsgObj);
                        callback(undefined, clientData);


                    }
                    else {
                        //record in DB
                        console.log("Not in clientList " + clientData);
                        msgBody.To = clientData;
                        DBController.PersistenceGroupMessageRecorder(msgBody, function (errSave, resSave) {
                            if (errSave) {
                                callback(errSave, undefined);
                            }
                            else {
                                callback(undefined, resSave);
                            }

                        });
                    }
                }
                else {
                    console.log("SERVER " + resServer);
                    console.log("My ID " + MyID);

                    console.log("Client " + clientData + " is not a registerd client");
                    DBController.ServerPicker(resServer, function (errSvrPick, resSvrPick) {

                        if (errSvrPick) {
                            console.log("error in Picking server from DB");
                            console.log("Destination user not found");
                            console.log("error " + errSvrPick);
                            callback(errSvrPick, undefined);

                        }
                        else {
                            var ServerIP = resSvrPick.URL;
                            console.log(ServerIP);
                            var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/Broadcast/' + clientData, ServerIP, version);
                            var options = {
                                url: httpUrl,
                                method: 'POST',
                                json: msgObj

                            };

                            console.log(options);
                            try {
                                httpReq(options, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        console.log("no errrs in request 200 ok");
                                        callback(undefined, response.statusCode);

                                    }
                                    else {
                                        console.log("errrs in request  " + error);
                                        callback(error, undefined);

                                    }
                                });
                            }
                            catch (ex) {
                                console.log("ex..." + ex);
                                callback(ex, undefined);

                            }

                        }
                    });
                }

            }
        });
    } catch (e) {
        callback(e,undefined);
    }

};

QueuedBroadcastMessageSender = function (msgObj,callabck) {

    try {
        console.log("Ypoooooo " + JSON.stringify(msgObj));
        var user = msgObj.To;
        var userData = msgObj;
        var userMessage = JSON.parse(userData.Callback).Message;


        if (Clients[user]) {
            var socket = Clients[user];
            var BcMsgObj = {

                "Message": userMessage
            };
            socket.emit('broadcast', BcMsgObj);
            callabck(undefined, "Success");
            //callback(undefined,user);

        }
        else {
            console.log("Not in clientList " + clientData);
            callback(new Error("Invalid Client " + user), undefined);

        }
    } catch (e) {
        callback(e,undefined);
    }

};

QueuedPubSubMessageSender = function (msgObj,callabck) {

    try {
        console.log("Ypoooooo " + JSON.stringify(msgObj));
        var user = msgObj.To;
        var userData = msgObj;
        var userMessage = JSON.parse(userData.Callback).Message;


        if (Clients[user]) {
            var socket = Clients[user];
            var BcMsgObj = {

                "Message": userMessage
            };
            socket.emit('publish', BcMsgObj);
            callabck(undefined, "Success");
            //callback(undefined,user);

        }
        else {
            console.log("Not in clientList " + clientData);
            callback(new Error("Invalid Client " + user), undefined);

        }
    } catch (e) {
        callback(e,undefined);
    }

};

SubscribeDataRecorder = function (dataObj,userId) {



};

PublishToUser = function (clientID,msgObj,callback) {

    /* redisManager.IsRegisteredClient(clientID, function (errAvbl,status,resAvbl) {

     console.log("Checking result "+resAvbl);

     if(status)
     {
     if(Clients[clientID])
     {
     var socket=Clients[clientID];
     socket.emit('publish',msgObj);
     callback(undefined,true);

     }
     else
     {

     }
     }
     else
     {
     if(errAvbl)
     {
     callback(errAvbl,undefined);
     }
     else
     {
     callback(new Error("Invalid User"),undefined);
     }

     }


     });*/

    try {
        redisManager.GetClientsServer(clientID, function (errServer, resServer) {
            if (errServer) {
                DBController.PersistencePubSubMessageRecorder(msgObj,clientID, function (errSave,resSave) {
                    if(errSave)
                    {
                        callback(errSave, undefined);
                    }
                    else
                    {
                        callback(undefined,resSave);
                    }
                });
            }
            else {
                console.log("Server " + resServer + " found for client " + clientID);

                if (MyID == resServer) {
                    if (Clients[clientID]) {
                        var socket = Clients[clientID];
                        socket.emit('publish', msgObj);
                        callback(undefined, clientID);
                    }
                    else {
                        console.log("Offline user");
                        DBController.PersistencePubSubMessageRecorder(msgObj,clientID, function (errSave,resSave) {
                            if(errSave)
                            {
                                callback(errSave, undefined);
                            }
                            else
                            {
                                callback(undefined,resSave);
                            }
                        });

                    }

                }
                else {
                    DBController.ServerPicker(resServer, function (errSvrPick, resSvrPick) {
                        if (errSvrPick) {
                            callback(errSvrPick, undefined);
                        }
                        else {
                            var ServerIP = resSvrPick.URL;
                            console.log(ServerIP);
                            var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/Publish/' + clientID, ServerIP, version);
                            var options = {
                                url: httpUrl,
                                method: 'POST',
                                json: msgObj

                            };

                            console.log(options);
                            try {
                                httpReq(options, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        console.log("no errrs in request 200 ok");
                                        callback(undefined, response.statusCode);

                                    }
                                    else {
                                        console.log("errrs in request  " + error);
                                        callback(error, undefined);

                                    }
                                });
                            }
                            catch (ex) {
                                console.log("ex..." + ex);
                                callback(ex, undefined);

                            }

                        }
                    });
                }

            }
        });
    } catch (e) {
        callback(e,undefined);
    }

};

InitiateSubscriber = function (clientID,msgObj,callback) {


    redisManager.IsRegisteredClient(clientID, function (errReg,status,resReg) {

        if(errReg)
        {
            console.log("Error in client registration checking "+errReg);
            callback(errReg,undefined);
        }
        else
        {
            if(resReg && status)
            {
                var key = "Query:" + uuid.v1();

                redisManager.QuerySubscriberRecorder(key,clientID, function (errSubs,resSubs) {

                    if(errSubs)
                    {
                        console.log("Subcriber record saving error "+errSubs);
                        callback(errSubs,undefined);
                    }
                    else
                    {
                        if(!resSubs)
                        {
                            console.log("Unable to save subs record");
                            callback(new Error("Invalid Data"),undefined)
                        }
                        else
                        {
                            msgObj.RefId=key;
                            var ServerIP="127.0.0.1:8050";
                            var httpUrl = util.format('http://%s/DVP/API/%s/CEP/ActivateQuery', ServerIP, version);
                            // msgObj.callbackURL=util.format('http://%s/DVP/API/%s/NotificationService/Notification/Publish', ServerIP, version);
                            var options = {
                                url : httpUrl,
                                method : 'POST',
                                json : msgObj

                            };

                            console.log(options);
                            try
                            {
                                httpReq(options, function (error, response, body)
                                {
                                    if (!error && response.statusCode == 200)
                                    {
                                        console.log("no errrs in request 200 ok");
                                        //callback(undefined,response.statusCode);
                                        callback(undefined,key);

                                    }
                                    else
                                    {
                                        console.log("errrs in request  "+error);
                                        callback(error,undefined);
                                        //callback(error,undefined);

                                    }
                                });
                            }
                            catch(ex)
                            {
                                console.log("ex..."+ex);
                                callback(ex,undefined);
                                //callback(ex,undefined);

                            }


                        }
                    }
                });
            }
            else
            {
                console.log("Client ID  not found  "+clientID);
                callback(new Error("Invalid ClientID"),undefined);
            }
        }
    });
}

function Crossdomain(req,res,next){


    var xml='<?xml version=""1.0""?><!DOCTYPE cross-domain-policy SYSTEM ""http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd""> <cross-domain-policy>    <allow-access-from domain=""*"" />        </cross-domain-policy>';

    /*var xml='<?xml version="1.0"?>\n';

     xml+= '<!DOCTYPE cross-domain-policy SYSTEM "/xml/dtds/cross-domain-policy.dtd">\n';
     xml+='';
     xml+=' \n';
     xml+='\n';
     xml+='';*/
    req.setEncoding('utf8');
    res.end(xml);

}

function Clientaccesspolicy(req,res,next){


    var xml='<?xml version="1.0" encoding="utf-8" ?>       <access-policy>        <cross-domain-access>        <policy>        <allow-from http-request-headers="*">        <domain uri="*"/>        </allow-from>        <grant-to>        <resource include-subpaths="true" path="/"/>        </grant-to>        </policy>        </cross-domain-access>        </access-policy>';
    req.setEncoding('utf8');
    res.end(xml);

}

RestServer.get("/crossdomain.xml",Crossdomain);
RestServer.get("/clientaccesspolicy.xml",Clientaccesspolicy);