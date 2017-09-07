/**
 * Created by Pawan on 10/1/2015.
 */
var redis=require('ioredis');
var config = require('config');
var port = config.Redis.port || 3000;
//var client = redis.createClient(port,config.Redis.ip);
var uuid = require('node-uuid');
var util = require('util');
//var io = require('socket.io')(config.Host.port);

var redisip = config.Redis.ip;
var redisport = config.Redis.port;
var redispass = config.Redis.password;
var redismode = config.Redis.mode;
var redisdb = config.Redis.db;



var redisSetting =  {
    port:redisport,
    host:redisip,
    family: 4,
    password: redispass,
    db: redisdb,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: function (err) {

        return true;
    }
};

if(redismode == 'sentinel'){

    if(config.Redis.sentinels && config.Redis.sentinels.hosts && config.Redis.sentinels.port, config.Redis.sentinels.name){
        var sentinelHosts = config.Redis.sentinels.hosts.split(',');
        if(Array.isArray(sentinelHosts) && sentinelHosts.length > 2){
            var sentinelConnections = [];

            sentinelHosts.forEach(function(item){

                sentinelConnections.push({host: item, port:config.Redis.sentinels.port})

            })

            redisSetting = {
                sentinels:sentinelConnections,
                name: config.Redis.sentinels.name,
                password: redispass
            }

        }else{

            console.log("No enough sentinel servers found .........");
        }

    }
}

var client = undefined;

if(redismode != "cluster") {
    client = new redis(redisSetting);
}else{

    var redisHosts = redisip.split(",");
    if(Array.isArray(redisHosts)){


        redisSetting = [];
        redisHosts.forEach(function(item){
            redisSetting.push({
                host: item,
                port: redisport,
                family: 4,
                password: redispass});
        });

        var client = new redis.Cluster([redisSetting]);

    }else{

        client = new redis(redisSetting);
    }


}

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function (result) {
    console.log("Redis connection established ");
});




var SocketObjectManager = function(TopicID,socketID,clientID,direction,From,clbk,state,ttl,callback)
{
    console.log("Redis Callback "+clbk);


    try {
        var key = "notification:" + TopicID;

        client.hmset(key, ["From", From, "Client", clientID, "Socket", socketID, "Direction", direction, "Callback", clbk, "State", state], function (errHmset, resHmset) {
            if (errHmset) {
                callback(errHmset, undefined);
            }
            else {
                TouchSession(key, ttl);
                callback(undefined, resHmset);
            }
        });
    }
    catch (e)
    {
        callback(e,undefined);
    }


};


var SetReferenceObject = function(company, tenant, topic, ttl, obj, callback){

    var key = util.format("%d:%d:NOTIFICATION:REFERENCE:%s", tenant, company, topic);
    var stringObj = JSON.stringify(obj);

    client.set(key,stringObj, function (errSet, resSet) {
        if (errSet) {
            callback(errSet, undefined);
        }
        else {
            if (resSet == "" || !resSet || resSet == "NULL") {
                callback(new Error("Invalid key to Update " + key), undefined);
            }
            else {
                console.log("value found ......");
                TouchSession(key, ttl);
                callback(undefined, resSet);
            }
        }
    });

};


var GetReferenceObject = function(company, tenant, topic, ttl,  callback){

    var key = util.format("%d:%d:NOTIFICATION:REFERENCE:%s", tenant, company, topic);

    client.get(key, function (errSet, resSet) {
        if (errSet) {
            callback(errSet, undefined);
        }
        else {
            if (resSet == "" || !resSet || resSet == "NULL") {
                callback(new Error("Invalid Key to Get " + key), undefined);
            }
            else {
                console.log("yap...............................");
                callback(undefined, JSON.parse(resSet));
            }
        }
    });

};



var SocketFinder = function(TopicID,ttl,callback)
{
    try {
        var key = "notification:" + TopicID;

        client.hmget(TopicID, "Client", "Socket", "Direction", "Callback", function (errUser, resUser) {
            if (errUser) {
                callback(errUser, undefined);
            }
            else {
                if (!resUser) {
                    callback(new Error("No Session Object Found"), undefined);
                }
                else {
                    TouchSession(key, ttl);
                    callback(undefined, resUser);
                }

            }
        });
    } catch (e) {
        callback(e,undefined);
    }
};

var SocketStateChanger = function(TopicID,State,ttl,callback)
{
    try {
        var key = "notification:" + TopicID;

        client.hmget(key, "Client", "Socket", "Direction", "Callback", function (errUser, resUser) {
            if (errUser) {
                callback(errUser, undefined);
            }
            else {
                if (!resUser) {
                    callback(new Error("No Session Object Found"), undefined);
                }
                else {
                    client.hmset(key, "State", State, function (errSt, resSt) {
                        if (errSt) {
                            callback(errSt, undefined);
                        } else {
                            if (!resSt || resSt == "") {
                                callback(new Error("State updation failed "), undefined);
                            }
                            else {
                                TouchSession(key, ttl);
                                callback(undefined, resUser[3]);
                            }

                        }

                    });
                }

            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }

};

var TouchSession =function(TopicID,TTL)
{
    client.expire(TopicID, TTL);
};

var SocketObjectUpdater = function(TopicID,SocketID,callback)
{
    console.log("TopicID "+TopicID);
    console.log("SOCKET "+SocketID);

    try {
        var key = "notification:" + TopicID;

        SocketFinder(key, 1000, function (errObj, resObj) {
            if (errObj) {
                callback(errObj, undefined);
            }
            else {
                if (!resObj) {
                    callback("NOOBJ", undefined);
                }
                else {
                    client.hmset(key, "Socket", SocketID, function (errUpdt, resUpdt) {
                        if (errUpdt) {
                            callback(errUpdt, undefined);
                        }
                        else {

                            if (resUpdt == "" || !resUpdt) {

                                callback(new Error("Nothing to update"), undefined);
                            } else {
                                callback(undefined, resUpdt);
                            }
                        }
                    });
                }

            }

        });
    } catch (e)
    {
        callback(e,undefined);
    }


};

var TokenObjectCreator = function(topicID,clientID,direction,reference,sender,resURL,ttl,callback)
{
    console.log("Token Object creation started");
    try {
        var key = "notification:" + topicID;
//notification:topic
        client.hmset(key, ["From", sender, "Client", clientID, "Reference", reference, "Direction", direction, "Callback", resURL], function (errHmset, resHmset) {
            if (errHmset) {
                callback(errHmset, undefined);
            }
            else {
                TouchSession(key, ttl);
                callback(undefined, resHmset);
            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }

};

var ResourceObjectCreator = function(clientID,TopicID,ttl,callback)
{
    console.log("Token Object creating");
    try {
        var objKey = "notification:" + clientID + ":" + TopicID;

        client.set(objKey, TopicID, function (errSet, resSet) {
            if (errSet) {
                callback(errSet, undefined);
            }
            else {
                if (resSet == "" || !resSet || resSet == "NULL") {
                    callback(new Error("Invalid key to Update " + objKey), undefined);
                }
                else {
                    console.log("yap...............................");
                    TouchSession(objKey, ttl);
                    callback(undefined, resSet);
                }
            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }

};

var ResourceObjectPicker = function(clientID,topicID,ttl,callback)
{
    console.log("Token Object searching");
    try {
        var objKey = "notification:" + clientID + ":" + topicID;
        var key = "notification:" + topicID;

        client.get(objKey, function (errGet, resGet) {
            if (errGet) {
                callback(errGet, undefined);
            }
            else {
                if (resGet == "" || !resGet || resGet == "NULL") {
                    callback(new Error("No such key found " + objKey), undefined);
                }

                else {
                    TouchSession(objKey, ttl);
                    //callback(undefined,resGet);
                    ResponseUrlPicker(key, ttl, function (errURL, resURL) {
                        if (errURL) {
                            console.log("Error in searching ResponceURL " + errURL);
                            callback(errURL, undefined);
                        }
                        else {
                            console.log("Response URL found " + resURL);
                            callback(undefined, resURL);
                        }
                    });
                }
            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }

};

var ResponseUrlPicker = function(topicID,ttl,callback)
{
    console.log("ResponseURL of "+topicID+ "picking ");
    try {
        var key = "notification:" + topicID;


        client.hmget(key, "Direction", "Callback", "Reference", function (errGet, resGet) {
            if (errGet) {
                callback(errGet, undefined);
            }
            else {
                if (!resGet) {
                    callback(new Error("No such key found " + topicID), undefined);
                }
                else if (resGet == "" || resGet == "NULL") {
                    TouchSession(topicID, ttl);
                    callback(undefined, "STATELESS");
                }
                else {
                    TouchSession(key, ttl);
                    callback(undefined, resGet);
                }
            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }
};


// sprint DUO V6 Voice UI 2

var RecordUserServer = function (clientName,server,callback)
{
    console.log("Client "+clientName);
    console.log("server "+server);
    try {
        var key = "notification:loc:" + clientName;//notification:loc....

        client.lpush(key, server, function (errSet, resSet) {
            if (errSet)
            {
                callback(errSet, undefined);
            }
            else
            {
                callback(undefined, resSet);
            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }
};

var UserServerUpdater = function (clientName,server,myID,callback)
{
    console.log("Client "+clientName);
    console.log("server "+server);
    console.log("ID of this Server "+myID);
    try {
        var key = "notification:loc:" + clientName + ":" + server;//notification:loc....
        var newKey = "notification:loc:" + clientName + ":" + myID;
        console.log("key " + key);
        console.log("New key " + newKey);

        client.rename(key, newKey, function (errRename, resRename) {
            if (errRename) {
                cosole.log("Error in Client Renaming "+ errRename);
                callback(errRename, undefined);
            }
            else {
                client.set(newKey, myID, function (errSet, resSet) {
                    if (errSet)
                    {
                        console.log("Error Server updating "+ errSet);
                        callback(errSet, undefined);
                    }
                    else
                    {
                        if (resSet == "" || !resSet || resSet == "NULL")
                        {
                            console.log("invalid key to set "+newKey);
                            callback(new Error("Invalid key to set "+newKey), undefined);
                        }
                        else
                        {
                            console.log("Server updated "+newKey);
                            callback(undefined, resSet);
                        }
                    }
                });
            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }

};

var GetClientsServer = function (clientName,callback) {

    var key="notification:loc:"+clientName;
    console.log(key);


    client.lrange(key,0,-1, function (errList,resList) {
        if(errList)
        {
            callback(errList,undefined);
        }
        else
        {
            callback(undefined,resList);
        }
    });



   /* try {
        client.keys(key, function (errGet, resGet) {
            if (errGet) {
                callback(errGet, undefined);
            }
            else {
                if (resGet == "" || !resGet || resGet == "NULL") {
                    callback(new Error("Invalid key to get "), undefined);
                }
                else {
                    var serverID = resGet[0].split(":")[3];

                    callback(undefined, serverID);
                }
            }
        });
    } catch (e)
    {
        callback(e,undefined);
    }*/
};



var TopicObjectPicker = function (topicId,ttl,callback) {

    try
    {
        TouchSession(topicId, ttl);

        var key = "notification:" + topicId;
        client.hgetall(key, function (errTkn, resTkn)
        {
            callback(errTkn, resTkn);
        });
    } catch (e)
    {
        callback(e,undefined);
    }

};

var ClientLocationDataRemover = function (clientID,server,callback) {

    try {
        var key = "notification:loc:" + clientID;
        client.lrem(key,1,server, function (e, r) {
            callback(e, r);
        })
    } catch (e)
    {
        callback(e,undefined);
    }
};

var SessionRemover = function (topicKey,callback) {

    try {
        var key = "notification:" + topicKey;
        client.del(key, function (e, r) {
            callback(e, r);
        });
    } catch (e)
    {
        callback(e,undefined);
    }
};

/*CheckClientAvailability = function (clientId,callback) {

 var key = "notification:loc:"+clientId+":*";

 console.log(key);
 try {
 client.keys(key, function (errClient, resClient) {

 if (errClient) {
 console.log("Error in checking Availability ", errClient);
 callback(errClient, false);
 }
 else {
 console.log("checking Availability Result ", resClient);

 if (!resClient || resClient == "" || resClient == null) {
 callback(undefined, true);
 }
 else {
 callback(undefined, false);
 }


 }

 });
 } catch (e)
 {
 callback(e,undefined);
 }
 };*/

var ResetServerData = function (serverID,callback) {

    var key= "notification:loc:*:"+serverID;
    console.log("Key ..... ",key);
    try {
        client.KEYS(key, function (errKeys, resKeys) {
            if (errKeys) {
                console.log("Error in searching keys ", err);
                callback(errKeys, undefined);
            }
            else {
                console.log("response in searching keys ", resKeys);
                if (!resKeys || resKeys == "" || resKeys == null) {
                    callback(undefined, "Already Cleared")
                }
                else {
                    console.log(resKeys);
                    client.del(resKeys,function (e,r) {
                        callback(e,r);
                    });

                }
            }
        });
    }
    catch (e) {
        callback(e,undefined);
    }

};

var RemoveKeys = function (keys,callback) {

    try {
        client.del(keys, function (e, r) {
            callback(e, r);
        });
    } catch (e) {
        callback(e,undefined);
    }

};

/*IsRegisteredClient = function (clientID,callback) {

 var key = "notification:loc:"+clientID;

 console.log("Reg key "+key);
 try {
 client.keys(key, function (errClient, resClient) {

 if (errClient) {
 console.log("Error in checking Availability ", errClient);
 callback(errClient, false, undefined);
 }
 else {
 console.log("checking Availability Result ", resClient);
 if (!resClient || resClient == "" || resClient == null) {
 callback(undefined, false, undefined);
 }
 else {
 console.log("Reg clients " + resClient);

 callback(undefined, true, resClient[0]);
 }


 }

 });
 } catch (e) {
 callback(e,undefined);
 }
 };*/

var BroadcastTopicObjectCreator = function (topicId,msgObj,clients,callback) {

    try {
        var groupTopicId = "Group:" + topicId;
        var direction = msgObj.Direction;
        var sender = msgObj.From;
        var callbackURL = "";
        if (direction == "STATEFUL") {
            callbackURL = msgObj.Callback;
        }
        if (!isNaN(msgObj.Timeout)) {
            TTL = msgObj.Timeout;
            console.log("TTL found " + TTL);
        }

        TokenObjectCreator(groupTopicId, clients, direction, sender, callbackURL, TTL, function (errTknCreate, resTknCreate) {

            if (errTknCreate) {
                console.log("Group Token creation error ", errTknCreate);
                callback(errTknCreate, undefined);
            }
            else {
                console.log("Token created ");
                callback(undefined, resTknCreate);
            }

        });
    } catch (e) {
        callback(e,undefined);
    }

};

var ParamKeyGenerator = function (paramData) {

    try {
        if (paramData) {
            var paramKey = "";
            var keyObj = Object.keys(paramData);
            for (var i = 0; i < keyObj.length; i++) {
                if (i == 0) {
                    paramKey = keyObj[i] + "-" + paramData[keyObj[i]];
                }
                else {
                    paramKey = paramKey + "-" + keyObj[i] + "-" + paramData[keyObj[i]];
                }

                if (i == keyObj.length - 1) {
                    return paramKey;
                }
            }
        }
        else {
            return null;
        }
    } catch (e) {
        return null;
    }


};

var QueryKeyGenerator = function (dataObj,clientID,callback) {

    /* try {
     IsRegisteredClient(clientID, function (errAvbl, status, datakey) {
     if (errAvbl) {
     console.log("error in searching client ", errAvbl);
     callback(errAvbl, undefined, "ERROR");
     }
     else {
     if (!status && !datakey) {
     console.log("No client found ");
     callback(new Error("No client found"), undefined, "ERROR");
     }
     else {
     var paramKey = ParamKeyGenerator(dataObj.FilterData);
     console.log("param key " + paramKey);
     if (paramKey) {
     var key = "Query:" + dataObj.Query + ":" + dataObj.Company + ":" + dataObj.Tenant + ":" + paramKey;

     QueryKeyAvailabilityChecker(key, function (errKeyAvbl, resKeyAvbl) {

     if (errKeyAvbl) {
     callback(errKeyAvbl, undefined, "ERROR");
     }
     else {
     if (!resKeyAvbl) {
     client.RPUSH(key, clientID, function (errKey, resKey) {
     if (errKey) {
     console.log("Error in push");
     callback(errKey, undefined, "ERROR");
     }
     else {
     console.log("Key " + key);
     callback(undefined, resKey, "NEWKEY");
     }
     });
     }
     else {
     SubsQueryUserAvailabitityChecker(key, clientID, function (errChk, resChk) {

     if (errChk) {
     console.log("Error in searching client subscription");
     callback(errChk, undefined, "ERROR");
     }
     else {
     if (resChk) {
     client.RPUSH(key, clientID, function (errKey, resKey) {
     if (errKey) {
     console.log("Error in push");
     callback(errKey, undefined, "ERROR");
     }
     else {
     console.log("Key " + key);
     callback(undefined, resKey, "REGEDKEY");
     }
     });
     }
     else {
     console.log("Already subscribed");
     callback(undefined, false, "SUBEDUSER");
     }

     }
     });
     }
     }

     });


     }
     else {
     console.log("Error in search");
     callback(new Error("Invalid param key"), undefined, "ERROR");
     }
     }
     }
     });
     } catch (e) {
     callback(e,undefined);
     }*/


    try {
        IsRegisteredClient(clientID, function (errAvbl, status, datakey) {
            if (errAvbl) {
                console.log("error in searching client ", errAvbl);
                callback(errAvbl, undefined, "ERROR");
            }
            else {
                if (!status && !datakey) {
                    console.log("No client found ");
                    callback(new Error("No client found"), undefined, "ERROR");
                }
                else {

                    var key = "Query:" + uuid.v1();

                    QueryKeyAvailabilityChecker(key, function (errKeyAvbl, resKeyAvbl) {

                        if (errKeyAvbl) {
                            callback(errKeyAvbl, undefined, "ERROR");
                        }
                        else {
                            if (!resKeyAvbl) {
                                client.SET(key, clientID, function (errKey, resKey) {
                                    if (errKey) {
                                        console.log("Error in push");
                                        callback(errKey, undefined, "ERROR");
                                    }
                                    else {
                                        console.log("Key " + key);
                                        callback(undefined, key, "NEWKEY");
                                    }
                                });
                            }
                            else {
                                console.log("INVALIDKEY" + key);
                                callback(new Error("Invalid Key"), undefined, "INVALIDKEY");
                            }
                        }

                    });



                }
            }
        });
    } catch (e) {
        callback(e,undefined,undefined);
    }


};

var SubsQueryUserAvailabitityChecker = function (queryKey,clientID,callback) {

    try {
        client.LRANGE(queryKey, 0, -1, function (errSubs, resSubs) {

            if (errSubs) {
                console.log("Error Range ", errSubs);
                callback(errSubs, undefined);
            }
            else {
                console.log("Done Range");
                console.log(resSubs);
                if (resSubs.indexOf(clientID) == -1) {

                    callback(undefined, true);

                }
                else {

                    callback(undefined, false);
                }
                // console.log(typeof (resSubs));
                // callback(undefined,resSubs);


            }
        });
    } catch (e) {
        callback(e,undefined);
    }
};

/*QueryKeySubscriberPicker = function (queryKey,callback) {

 try {
 client.GET(queryKey, function (errSubs, resSubs) {

 if (errSubs) {
 console.log("Error in Query key checker ", errSubs);
 callback(errSubs, undefined);
 }
 else {

 if (resSubs) {
 callback(undefined, resSubs);
 }
 else {
 callback(undefined, false);
 }

 }
 });
 } catch (e) {
 callback(e,undefined);
 }
 };*/
var QueryKeySubscriberPicker = function (queryKey,callback) {

    try {
        client.lrange(queryKey,0,-1, function (errSubs,resSubs) {

            if (errSubs) {
                console.log("Error in Query key checker ", errSubs);
                callback(errSubs, undefined);
            }
            else
            {
                callback(undefined, resSubs);

            }
        });
    } catch (e) {
        callback(e,undefined);
    }
};

var QueryKeyAvailabilityChecker = function (key,callback) {

    try {
        client.keys(key, function (errKey, resKey) {

            if (errKey) {
                callback(errKey, false);
            }
            else {
                if (!resKey || resKey == "" || resKey == null) {
                    callback(undefined, false);
                }
                else {
                    callback(undefined, true);

                }
            }
        });
    } catch (e) {
        callback(e,undefined);
    }

};

var QuerySubscriberRecorder = function (key,userID,callback) {

    client.lrange(key,0,-1, function (errList,resList)
    {
        if(errList)
        {
            callback(errList,undefined);
        }
        else if(resList.length==0 || userID.indexOf(resList)==-1)
        {
            client.lpush(key,userID, function (errAdd,resAdd) {

                if(errAdd)
                {
                    callback(errAdd,undefined);
                }
                else
                {
                    callback(null,resAdd);
                }
            });
        }
        else
        {
            callback(null,"success");
        }

    });

};

var QueryUnsubscriber = function (key,userID,callback) {

    client.lrem(key,-1,userID, function (errRem,resRem)
    {
        if(errRem)
        {
            callback(errRem,undefined);
        }
        else
        {
            callback(undefined,resRem);
        }

    });

};

var LocationListPicker = function (clientId,callback) {

    var key = "notification:loc:" + clientId;
    client.lrange(key,0,-1, function (errList,resList) {
        if(errList)
        {
            callback(errList,undefined);
        }
        else
        {
            callback(undefined,resList);
        }
    });
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


module.exports.GetReferenceObject =GetReferenceObject;
module.exports.SetReferenceObject = SetReferenceObject;




module.exports.ClientLocationDataRemover = ClientLocationDataRemover;
module.exports.SessionRemover = SessionRemover;
//module.exports.CheckClientAvailability = CheckClientAvailability;
module.exports.ResetServerData = ResetServerData;
//module.exports.IsRegisteredClient = IsRegisteredClient;
module.exports.BroadcastTopicObjectCreator = BroadcastTopicObjectCreator;
module.exports.ParamKeyGenerator = ParamKeyGenerator;
module.exports.QueryKeyGenerator = QueryKeyGenerator;
module.exports.UserServerUpdater = UserServerUpdater;
module.exports.SubsQueryUserAvailabitityChecker = SubsQueryUserAvailabitityChecker;
module.exports.QueryKeySubscriberPicker = QueryKeySubscriberPicker;
module.exports.QuerySubscriberRecorder = QuerySubscriberRecorder;
module.exports.LocationListPicker = LocationListPicker;
module.exports.QueryUnsubscriber = QueryUnsubscriber;





