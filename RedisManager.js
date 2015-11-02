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
                client.hset(TopicID,"State",State,function(errSt,resSt)
                {
                    if(errSt)
                    {
                        callback(errSt,undefined);
                    }else
                    {
                        TouchSession(TopicID,ttl);
                        callback(undefined,resUser[3]);
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
module.exports.SocketObjectManager = SocketObjectManager;
module.exports.SocketFinder = SocketFinder;
module.exports.SocketStateChanger = SocketStateChanger;