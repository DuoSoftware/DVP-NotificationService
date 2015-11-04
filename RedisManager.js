/**
 * Created by Pawan on 10/1/2015.
 */
var redis=require('redis');
var config = require('config');
var port = config.Redis.port || 3000;
var client = redis.createClient(config.Redis.port,config.Redis.ip);
//var io = require('socket.io')(config.Host.port);
client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function (err) {
    client.select(config.Redis.db, redis.print);
});


SocketObjectManager = function(TopicID,socketID,clientID,direction,From,clbk,state,ttl,callback)
{
    console.log("Redis Callback "+clbk);
    client.hmset(TopicID,["From",From,"Client",clientID,"Socket",socketID,"Direction",direction,"Callback",clbk,"State",state],function(errHmset,resHmset)
    {
        if(errHmset)
        {
            callback(errHmset,undefined);
        }
        else
        {
            TouchSession(TopicID, ttl);
            callback(undefined,resHmset);
        }
    });


};

SocketFinder = function(TopicID,ttl,callback)
{
    client.hmget(TopicID,"Client","Socket","Direction","Callback",function(errUser,resUser)
    {
        if(errUser)
        {
            callback(errUser,undefined);
        }
        else
        {
            if(!resUser)
            {
                callback(new Error("No Session Object Found"),undefined);
            }
            else
            {
                TouchSession(TopicID,ttl);
                callback(undefined,resUser);
            }

        }
    });
};

SocketStateChanger = function(TopicID,State,ttl,callback)
{
    client.hmget(TopicID,"Client","Socket","Direction","Callback",function(errUser,resUser)
    {
        if(errUser)
        {
            callback(errUser,undefined);
        }
        else
        {
            if(!resUser)
            {
                callback(new Error("No Session Object Found"),undefined);
            }
            else
            {
                client.hmset(TopicID,"State",State,function(errSt,resSt)
                {
                    if(errSt)
                    {
                        callback(errSt,undefined);
                    }else
                    {
                        if(!resSt || resSt=="")
                        {
                            callback(new Error("State updation failed "),undefined);
                        }
                        else
                        {
                            TouchSession(TopicID,ttl);
                            callback(undefined,resUser[3]);
                        }

                    }

                });
            }

        }
    });

};

TouchSession =function(TopicID,TTL)
{
    client.expire(TopicID, TTL);
};

SocketObjectUpdater = function(TopicID,SocketID,callback)
{
    console.log("TopicID "+TopicID);
    console.log("SOCKET "+SocketID);

    SocketFinder(TopicID,1000,function(errObj,resObj)
    {
        if(errObj)
        {
            callback(errObj,undefined);
        }
        else
        {
            if(!resObj)
            {
               callback("NOOBJ",undefined);
            }
            else
            {
                client.hmset(TopicID,"Socket",SocketID,function(errUpdt,resUpdt)
                {
                    if(errUpdt)
                    {
                        callback(errUpdt,undefined);
                    }
                    else
                    {

                        if(resUpdt=="" || !resUpdt)
                        {

                            callback(new Error("Nothing to update"),undefined);
                        }else
                        {
                            callback(undefined,resUpdt);
                        }
                    }
                });
            }

        }

    });


};

TokenObjectCreater = function(topicID,clientID,direction,sender,resURL,callback)
{
    console.log("Token Object creating");

    client.hmset(topicID,["From",sender,"Client",clientID,"Direction",direction,"Callback",resURL],function(errHmset,resHmset)
    {
        if(errHmset)
        {
            callback(errHmset,undefined);
        }
        else
        {

            callback(undefined,resHmset);
        }
    });

};

ResourceObjectCreator = function(clientID,TopicID,ttl,callback)
{
    console.log("Token Object creating");
    var objKey=clientID+":"+TopicID;

    client.set(objKey,TopicID,function(errSet,resSet)
    {
        if(errSet)
        {
            callback(errSet,undefined);
        }
        else
        {
            if(resSet=="" || !resSet || resSet== "NULL")
            {
                callback(new Error("Invalid key to Update " + objKey),undefined);
            }
            else
            {
                TouchSession(objKey, ttl);
                callback(undefined,resSet);
            }
        }
    });

};

ResourceObjectPicker = function(clientID,topicID,ttl,callback)
{
    console.log("Token Object creating");
    var objKey=clientID+":"+topicID;

    client.get(objKey,function(errGet,resGet)
    {
        if(errGet)
        {
            callback(errGet,undefined);
        }
        else
        {
            if(resGet=="" || !resGet || resGet == "NULL")
            {
                callback(new Error("No such key found " + objKey),undefined);
            }

            else
            {
                TouchSession(objKey, ttl);
                //callback(undefined,resGet);
                ResponseUrlPicker(topicID,function(errURL,resURL)
                {
                    if(errURL)
                    {
                        console.log("Error in searching ResponceURL "+errURL);
                        callback(errURL,undefined);
                    }
                    else
                    {
                        console.log("Response URL found "+resURL);
                        callback(undefined,resURL);
                    }
                });
            }
        }
    });

};

ResponseUrlPicker = function(topicID,callback)
{
    console.log("ResponseURL of "+topicID+ "picking ");


    client.hmget(topicID,"Callback",function(errGet,resGet)
    {
        if(errGet)
        {
            callback(errGet,undefined);
        }
        else
        {
            if( !resGet )
            {
                callback(new Error("No such key found " + topicID),undefined);
            }
            else if(resGet=="" || resGet == "NULL")
            {
                callback(undefined,"STATELESS");
            }
            else
            {

                callback(undefined,resGet[0]);
            }
        }
    });
};

//ClientTokenPicker = function()
module.exports.SocketObjectManager = SocketObjectManager;
module.exports.SocketFinder = SocketFinder;
module.exports.SocketStateChanger = SocketStateChanger;
module.exports.SocketObjectUpdater = SocketObjectUpdater
module.exports.TokenObjectCreater = TokenObjectCreater;
module.exports.ResourceObjectCreator = ResourceObjectCreator;
module.exports.ResourceObjectPicker = ResourceObjectPicker;
module.exports.ResponseUrlPicker = ResponseUrlPicker;