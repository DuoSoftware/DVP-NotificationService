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

client.select(9, function () {

});


SocketObjectManager = function(TopicID,socketID,clientID,direction,From,clbk,state,ttl,callback)
{
    console.log("Redis Callback "+clbk);

    var key ="notification:"+TopicID;

    client.hmset(key,["From",From,"Client",clientID,"Socket",socketID,"Direction",direction,"Callback",clbk,"State",state],function(errHmset,resHmset)
    {
        if(errHmset)
        {
            callback(errHmset,undefined);
        }
        else
        {
            TouchSession(key, ttl);
            callback(undefined,resHmset);
        }
    });


};

SocketFinder = function(TopicID,ttl,callback)
{
    var key ="notification:"+TopicID;

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
                TouchSession(key,ttl);
                callback(undefined,resUser);
            }

        }
    });
};

SocketStateChanger = function(TopicID,State,ttl,callback)
{
    var key ="notification:"+TopicID;

    client.hmget(key,"Client","Socket","Direction","Callback",function(errUser,resUser)
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
                client.hmset(key,"State",State,function(errSt,resSt)
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
                            TouchSession(key,ttl);
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

    var key ="notification:"+TopicID;


    SocketFinder(key,1000,function(errObj,resObj)
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
                client.hmset(key,"Socket",SocketID,function(errUpdt,resUpdt)
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

TokenObjectCreator = function(topicID,clientID,direction,sender,resURL,ttl,callback)
{
    console.log("Token Object creating");
    var key ="notification:"+topicID;
//notification:topic
    client.hmset(key,["From",sender,"Client",clientID,"Direction",direction,"Callback",resURL],function(errHmset,resHmset)
    {
        if(errHmset)
        {
            callback(errHmset,undefined);
        }
        else
        {
            TouchSession(key, ttl);
            callback(undefined,resHmset);
        }
    });

};

ResourceObjectCreator = function(clientID,TopicID,ttl,callback)
{
    console.log("Token Object creating");
    var objKey="notification:"+clientID+":"+TopicID;

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
                console.log("yap...............................");
                TouchSession(objKey, ttl);
                callback(undefined,resSet);
            }
        }
    });

};

ResourceObjectPicker = function(clientID,topicID,ttl,callback)
{
    console.log("Token Object searching");
    var objKey="notification:"+clientID+":"+topicID;
    var key ="notification:"+topicID;

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
                ResponseUrlPicker(key,ttl,function(errURL,resURL)
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

ResponseUrlPicker = function(topicID,ttl,callback)
{
    console.log("ResponseURL of "+topicID+ "picking ");
    var key ="notification:"+topicID;


    client.hmget(key,"Direction","Callback",function(errGet,resGet)
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
                TouchSession(topicID, ttl);
                callback(undefined,"STATELESS");
            }
            else
            {
                TouchSession(key, ttl);
                callback(undefined,resGet);
            }
        }
    });
};


// sprint DUO V6 Voice UI 2

RecordUserServer = function (clientName,server,callback)
{

    var key="notification:loc:"+clientName+":"+server;//notification:loc....

    client.set(key,server,function(errSet,resSet)
    {
        if(errSet)
        {
            callback(errSet,undefined);
        }
        else
        {
            if(resSet=="" || !resSet || resSet== "NULL")
            {
                callback(new Error("Invalid key to set "),undefined);
            }
            else
            {
                callback(undefined,resSet);
            }
        }
    });
};

GetClientsServer = function (clientName,callback) {

    var key="notification:loc:"+clientName+":*";
    console.log(key);
    client.keys(key,function(errGet,resGet)
    {
        if(errGet)
        {
            callback(errGet,undefined);
        }
        else
        {
            if(resGet=="" || !resGet || resGet== "NULL")
            {
                callback(new Error("Invalid key to get "),undefined);
            }
            else
            {
                var serverID = resGet[0].split(":")[3];

                callback(undefined,serverID);
            }
        }
    });
};

TopicObjectPicker = function (topicId,ttl,callback) {

    TouchSession(topicId,ttl);
    var key = "notification:"+topicId;
    client.hgetall(key, function (errTkn,resTkn) {
        callback(errTkn,resTkn);

    });

};

ClientLocationDataRemover = function (clientID,server,callback) {

    var key = "notification:loc:"+clientID+":"+server;
    client.del(key, function (e,r) {
        callback(e,r);
    })
};

SessionRemover = function (topicKey,callback) {

    var key ="notification:"+topicKey;
    client.del(key, function (e,r) {
        callback(e,r);
    });
};

CheckClientAvailability = function (clientId,callback) {

    var key = "notification:loc:"+clientId+":*";

    console.log(key);
    client.keys(key, function (errClient,resClient) {

        if(errClient)
        {
            console.log("Error in checking Availability ",errClient);
            callback(errClient,false);
        }
        else
        {
            console.log("checking Availability Result ",resClient);
            if(!resClient || resClient=="" || resClient == null)
            {
                callback(undefined,true);
            }
            else
            {
                callback(undefined,false);
            }


        }

    });
};

ResetServerData = function (serverID,callback) {

    var key= "notification:loc:*:"+serverID;
    console.log("Key ..... ",key);
    client.KEYS(key, function (errKeys,resKeys) {
        if(errKeys)
        {
            console.log("Error in searching keys ",err);
            callback(errKeys,undefined);
        }
        else
        {
            console.log("response in searching keys ",resKeys);
            if(!resKeys || resKeys=="" || resKeys ==null)
            {
                callback(undefined,"Already Cleared")
            }
            else
            {
                console.log(resKeys);
                var delKeys="";
                /* for(var i=0;i<resKeys.length;i++)
                 {
                 delKeys=delKeys.concat(" ");
                 delKeys=delKeys.concat(resKeys[i]);

                 if(i==resKeys.length-1)
                 {
                 //callback(undefined,delKeys);
                 console.log("HIT");
                 RemoveKeys(delKeys, function (e,r) {
                 callback(e,r);
                 })
                 }
                 }*/

                client.del(resKeys, function (e,r) {
                    callback(e,r);
                })

            }
        }
    });

};

RemoveKeys = function (keys,callback) {

    client.del(keys, function (e,r) {
        callback(e,r);
    });

};

IsRegisteredClient = function (clientID,callback) {

    var key = "notification:loc:"+clientID+":*";

    console.log("Reg key "+key);
    client.keys(key, function (errClient,resClient) {

        if(errClient)
        {
            console.log("Error in checking Availability ",errClient);
            callback(errClient,false,undefined);
        }
        else
        {
            console.log("checking Availability Result ",resClient);
            if(!resClient || resClient=="" || resClient == null)
            {
                callback(undefined,false,undefined);
            }
            else
            {
                console.log("Reg clients "+resClient);

                callback(undefined,true,resClient[0]);
            }


        }

    });
};

BroadcastTopicObjectCreator = function (topicId,msgObj,clients,callback) {

    var groupTopicId = "Group:"+topicId;
    var direction = msgObj.Direction;
    var sender = msgObj.From;
    var callbackURL="";
    if(direction=="STATEFUL")
    {
        callbackURL=msgObj.Callback;
    }
    if(!isNaN(msgObj.Timeout))
    {
        TTL =msgObj.Timeout;
        console.log("TTL found "+TTL);
    }

    TokenObjectCreator(groupTopicId,clients,direction,sender,callbackURL,TTL, function (errTknCreate,resTknCreate) {

        if(errTknCreate)
        {
            console.log("Group Token creation error ",errTknCreate);
            callback(errTknCreate,undefined);
        }
        else
        {
            console.log("Token created ");
            callback(undefined,resTknCreate);
        }

    });

};

ParamKeyGenerator = function (paramData) {

    if(paramData)
    {
        var paramKey ="";
        var keyObj=Object.keys(paramData);
        for(var i=0;i<keyObj.length;i++)
        {
            if(i==0)
            {
                paramKey=keyObj[i]+"-"+paramData[keyObj[i]];
            }
            else
            {
                paramKey=paramKey+"-"+keyObj[i]+"-"+paramData[keyObj[i]];
            }

            if(i==keyObj.length-1)
            {
                return paramKey;
            }
        }
    }
    else
    {
        return null;
    }


};

QueryKeyGenerator = function (dataObj,clientID,callback) {

    IsRegisteredClient(clientID, function (errAvbl,status,datakey) {
        if(errAvbl)
        {
            console.log("error in searching client ",errAvbl);
            callback(errAvbl,undefined);
        }
        else
        {
            if(!status && !datakey)
            {
                console.log("No client found ");
                callback(new Error("No client found"),undefined);
            }
            else
            {
                var paramKey = ParamKeyGenerator(dataObj.FilterData);
                if(paramKey)
                {
                    var key = "Query:"+dataObj.Query+":"+dataObj.Company+":"+dataObj.Tenant+":"+paramKey;
                    client.RPUSH(key,clientID, function (errKey,resKey) {
                        if(errKey)
                        {
                            console.log("Error in push");
                            callback(errKey,undefined);
                        }
                        else
                        {
                            console.log("Key "+key);
                            callback(undefined,resKey);
                        }
                    });

                }
                else
                {
                    console.log("Error in search");
                    callback(new Error("Invalid param key"),undefined);
                }
            }
        }
    });


    // client.RPUSH("key",)
};



module.exports.SocketObjectManager = SocketObjectManager;
module.exports.SocketFinder = SocketFinder;
module.exports.SocketStateChanger = SocketStateChanger;
module.exports.SocketObjectUpdater = SocketObjectUpdater;
module.exports.TokenObjectCreator = TokenObjectCreator;
module.exports.ResourceObjectCreator = ResourceObjectCreator;
module.exports.ResourceObjectPicker = ResourceObjectPicker;
module.exports.ResponseUrlPicker = ResponseUrlPicker;
module.exports.RecordUserServer = RecordUserServer;
module.exports.GetClientsServer = GetClientsServer;
module.exports.TopicObjectPicker = TopicObjectPicker;
module.exports.ClientLocationDataRemover = ClientLocationDataRemover;
module.exports.SessionRemover = SessionRemover;
module.exports.CheckClientAvailability = CheckClientAvailability;
module.exports.ResetServerData = ResetServerData;
module.exports.IsRegisteredClient = IsRegisteredClient;
module.exports.BroadcastTopicObjectCreator = BroadcastTopicObjectCreator;
module.exports.ParamKeyGenerator = ParamKeyGenerator;
module.exports.QueryKeyGenerator = QueryKeyGenerator;



