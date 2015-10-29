/**
 * Created by Pawan on 10/1/2015.
 */
var redis=require('redis');
var config = require('config');
var port = config.Host.port || 3000;
var client = redis.createClient(config.Redis.port,config.Redis.ip);
var io = require('socket.io')(config.Host.port);
client.on("error", function (err) {
    console.log("Error " + err);
});


SocketObjectManager = function(TopicID,socketID,clientID,direction,From,clbk,callback)
{
    console.log("Redis Callback "+clbk);
    client.hmset(TopicID,["From",From,"Client",clientID,"Socket",socketID,"Direction",direction,"Callback",clbk],function(errHmset,resHmset)
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

SocketFinder = function(TopicID,callback)
{
    client.hmget(TopicID,"Client","Socket","Direction","Callback",function(errUser,resUser)
    {
        if(errUser)
        {
            callback(errUser,undefined);
        }
        else
        {
            callback(undefined,resUser);
        }
    })
};

module.exports.SocketObjectManager = SocketObjectManager;
module.exports.SocketFinder = SocketFinder;