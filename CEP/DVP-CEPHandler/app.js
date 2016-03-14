/**
 * Created by Pawan on 3/8/2016.
 */
var config=require('config');
var restify = require('restify');
var port = config.Host.port || 3000;
var version=config.Host.version;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var httpReq = require('request');
var redismanager = require('./RedisManager.js');
var util = require('util');

var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
});
restify.CORS.ALLOW_HEADERS.push('authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());

RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);


});

RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());


RestServer.post('/DVP/API/'+version+'/CEPHandler/Notification/Publish', function (req,res,next){

    console.log("method hit");
    var msgObj=req.body.data;
    var queryKey =QueryKeyGenerator(msgObj);
    console.log("Query key "+queryKey);

    if(queryKey)
    {
        redismanager.QueryKeySubscriberPicker(queryKey, function (errSubs,resSubs) {

            if(errSubs)
            {
                console.log(errSubs);
                res.end();
            }
            else
            {
                // ServerPicker()
                console.log(resSubs);
                var subsCount = resSubs.length;

                for(var i=0;i<resSubs.length;i++)
                {
                    console.log("I ==== "+i);
                    console.log("Length ==== "+resSubs.length);
                    PublishToUser(resSubs[i],msgObj, function (errPublish,resPublish) {

                        console.log("")
                        if(i==subsCount)
                        {
                            console.log("End");
                            res.end("Done publish")
                        }

                        if(errPublish)
                        {
                            //res.end("Error");
                            console.log(errPublish);

                        }
                        else
                        {
                            console.log("Success");
                            //res.end("Done");
                        }
                    });
                }
            }
        });
    }
    else
    {
        console.log("no Key found");
        res.end("no Key found");
    }


    return next();
});

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
QueryKeyGenerator = function (dataObj) {

    var paramKey = ParamKeyGenerator(dataObj.FilterData);
    if(paramKey)
    {
        var key = "Query:"+dataObj.Query+":"+dataObj.Company+":"+dataObj.Tenant+":"+paramKey;
        return key;

    }
    else
    {
        console.log("Error in key making");
        return null;

    }





    // client.RPUSH("key",)
};
PublishToUser = function (userID,msgObj,callback) {

    redismanager.ServerPicker(userID, function (errSID,resSID) {

        if(errSID)
        {
            callback(errSID,undefined);
        }
        else
        {
            ServerLocationPicker(resSID, function (errSloc,resSloc) {

                if(errSloc)
                {
                    callback(errSloc,undefined);
                }
                else
                {
                    var ServerIP=resSloc.URL;
                    console.log("IP "+ServerIP);
                    var httpUrl = util.format('http://%s/DVP/API/%s//NotificationService/Notification/Publish/'+userID, ServerIP, version);
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
                                callback(undefined,response);

                            }
                            else
                            {
                                console.log("errrs in request  "+error);
                                callback(error,undefined);

                            }
                        });
                    }
                    catch(ex)
                    {
                        console.log("ex..."+ex);
                        callback(ex,undefined);

                    }
                }
            });
        }

    });


};
ServerLocationPicker = function (serverID,callback) {

    DbConn.NotificationServer.find({where:{id:serverID}}).then(function (resServ) {

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
