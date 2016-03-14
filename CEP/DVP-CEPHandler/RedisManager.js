/**
 * Created by Pawan on 3/9/2016.
 */
var redis=require('redis');
var config = require('config');
var port = config.Redis.port || 3000;
var client = redis.createClient(config.Redis.port,config.Redis.ip);

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function (err) {
    client.select(config.Redis.db, redis.print);
});

client.select(9, function () {

});

QueryKeySubscriberPicker = function (queryKey,callback) {

    client.LRANGE(queryKey,0,-1, function (errSubs,resSubs) {

        if(errSubs)
        {
            console.log("Error Range ",errSubs);
            callback(errSubs,undefined);
        }
        else
        {
            console.log("Done Range");
            console.log(typeof (resSubs));
            callback(undefined,resSubs);
        }
    });
};

ServerPicker = function (clientID,callback) {

    var key="notification:loc:"+clientID+":*";
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

module.exports.QueryKeySubscriberPicker = QueryKeySubscriberPicker;
module.exports.ServerPicker = ServerPicker;
