/**
 * Created by Pawan on 2/24/2016.
 */
var mongoose = require('mongoose');
var DbConn = require('dvp-dbmodels');
var User = require('dvp-mongomodels/model/User');
var InboxMessage = require('dvp-mongomodels/model/UserInbox').InboxMessage;
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var httpReq = require('request');
var util = require('util');
var config=require('config');
var token=config.Token;

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');

var ServerPicker = function (SID,callback) {

    try {
        DbConn.NotificationServer.find({where: {id: SID}}).then(function (resServ) {

            if (resServ) {
                callback(undefined, resServ);
            }
            else {
                callback(new Error("Invalid ID"), undefined);
            }
        }).catch(function (errServ) {
            console.log(errServ);
            callback(errServ, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }
};

var ClientServerPicker = function (SID,index,callback) {


    try {
        DbConn.NotificationServer.find({where: {id: SID}}).then(function (resServ) {

            if (resServ) {
                callback(undefined, resServ,index);
            }
            else {
                callback(new Error("Invalid ID"), undefined,index);
            }
        }).catch(function (errServ) {
            console.log(errServ);
            callback(errServ, undefined,index);
        });
    } catch (e) {
        callback(e,undefined,index);
    }
};

var PersistenceMessageRecorder = function (Obj,callback) {

    console.log("Persistance message recorder starts");

    try {
        var dataBody = Obj.body;
        var topic = "";
        if (Obj.params.Topic) {
            topic = Obj.params.Topic;
        }

        console.log("Topic " + topic);

        var CallbackObj = {

            Timeout: dataBody.Timeout,
            Message: dataBody.Message,
            Ref: dataBody.Ref,
            Direction: dataBody.Direction,
            Topic: topic,
            CallbackURL: dataBody.Callback,
            MessageType: "GENERAL",
            eventName:Obj.headers.eventname,
            eventUuid:Obj.headers.eventuuid
        };
        try {
            var newMessageObject = DbConn.PersistenceMessages
                .build(
                {
                    From: dataBody.From,
                    To: dataBody.To,
                    Time: Date.now(),
                    Callback: JSON.stringify(CallbackObj),
                    CompanyId:Obj.user.company,
                    TenantId:Obj.user.tenant

                }
            )
        }
        catch (e) {
            callback(e, undefined);
        }

        newMessageObject.save().then(function (resSave) {
            callback(undefined, resSave)
        }).catch(function (errSave) {
            callback(errSave, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }
};

var GetPersistenceMessages = function (clientID,company,tenant,callback) {

    try {
        DbConn.PersistenceMessages.findAll({where: [{To: clientID},{CompanyId:company},{TenantId:tenant}]}).then(function (resMessages) {
            callback(undefined, resMessages);

        }).catch(function (errMessages) {
            callback(errMessages, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }

};

var PersistenceMessageRemover = function (msgId,company,tenant,callback) {

    try {
        DbConn.PersistenceMessages.destroy({where: [{id: msgId},{CompanyId:company},{TenantId:tenant}]}).then(function (resRem) {
            callback(undefined, resRem);
        }).catch(function (errRem) {
            callback(errRem, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }
};

var RemoveAllPersistenceMessages = function (user,company,tenant,callback) {

    try {
        DbConn.PersistenceMessages.destroy({where: [{To: user},{CompanyId:company},{TenantId:tenant}]}).then(function (resRem) {
            callback(undefined, resRem);
        }).catch(function (errRem) {
            callback(errRem, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }
};

var PersistenceGroupMessageRecorder = function (Obj,callback) {

    try {
        var dataBody = Obj;
        console.log("To Db of records " + dataBody);


        var CallbackObj = {

            Timeout: dataBody.Timeout,
            Message: dataBody.Message,
            Ref: dataBody.Ref,
            Direction: dataBody.Direction,
            Topic: "",
            CallbackURL: "",
            MessageType: "BROADCAST"
        };

        console.log("Saving " + CallbackObj);

        var newMessageObject = DbConn.PersistenceMessages
            .build(
            {
                From: dataBody.From,
                To: dataBody.To,
                Time: Date.now(),
                Callback: JSON.stringify(CallbackObj)

            }
        );


        newMessageObject.save().then(function (resSave) {
            callback(undefined, resSave)
        }).catch(function (errSave) {
            callback(errSave, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }
};

var PersistencePubSubMessageRecorder = function (Obj,clientID,callback) {

    try {
        var dataBody = Obj;
        console.log(JSON.stringify(Obj));
        var topic = "";

        console.log("Topic " + topic);

        var CallbackObj = {

            Timeout: "",
            Message: dataBody.Message,
            Ref: dataBody.refID,
            Direction: "STATELESS",
            Topic: topic,
            CallbackURL: "",
            MessageType: "CEP"
        };
        try {
            var newMessageObject = DbConn.PersistenceMessages
                .build(
                {
                    From: "CEP",
                    To: clientID,
                    Time: Date.now(),
                    Callback: JSON.stringify(CallbackObj)

                }
            )
        }
        catch (e) {
            callback(e, undefined);
        }

        newMessageObject.save().then(function (resSave) {
            callback(undefined, resSave)
        }).catch(function (errSave) {
            callback(errSave, undefined);
        });
    } catch (e) {
        console.log("errr");
        callback(e,undefined);
    }
};

var GCMRegistrator = function (clientID,regKey,res) {
    var jsonString;
    try {
        var gcmKey = DbConn.GCMKeys
            .build(
            {
                ClientID: clientID,
                GCMKey: regKey

            }
        );


        gcmKey.save().then(function (resSave) {

            console.log("GCM record successfully saved");
            jsonString = messageFormatter.FormatMessage(undefined, "GCM record successfully saved", true, resSave);
            res.end(jsonString);


        }).catch(function (errSave) {
            console.log("GCM record insertion failed");
            jsonString = messageFormatter.FormatMessage(errSave, "GCM record insertion failed", false, undefined);
            res.end(jsonString);
        });
    } catch (ex) {
        console.log("Exception in GCM Recorder");
        jsonString = messageFormatter.FormatMessage(ex, "GCM record insertion failed", false, undefined);
        res.end(jsonString);
    }


};
var GCMKeyRemover = function (clientID,regKey,res) {
    var jsonString;


    DbConn.GCMKeys.destroy({where:[{GCMKey:regKey},{ClientID:clientID}]}).then(function (resRemove) {

        console.log("GCM record successfully removed");
        jsonString = messageFormatter.FormatMessage(undefined, "GCM record successfully removed", true, resRemove);
        res.end(jsonString);

    }).catch(function (errRemove) {
        console.log("GCM record deletion failed");
        jsonString = messageFormatter.FormatMessage(errRemove, "GCM record deletion failed", false, undefined);
        res.end(jsonString);
    });



};

var GoogleNotificationKeyPicker = function (clientID,callback) {

    DbConn.GCMKeys.findAll({attributes: ['GCMKey'],where:{ClientID:clientID}}).then(function (resKeys) {

        if(resKeys.length>0)
        {
            var GCMkeys=[];
            for(var i=0;i<resKeys.length;i++)
            {
                GCMkeys.push(resKeys[i].GCMKey);
                if(i==resKeys.length-1)
                {
                    callback(undefined,GCMkeys)
                }
            }

        }

        else
        {
            console.log("Key not found");
            callback(undefined,null);
        }

    }).catch(function (errKeys) {
        console.log("Error in key searching ",errKeys);
        callback("Error in key searching "+errKeys,undefined);
    });



};

var SipUserDetailsPicker = function (sipUsername,company,tenant,callback) {

    DbConn.SipUACEndpoint.find({where:[{SipUsername:sipUsername},{CompanyId:company},{TenantId:tenant}]}).then(function (resSipUserData) {
        if(!resSipUserData)
        {
            callback(new Error("User not found"),undefined);
        }
        else
        {
            callback(undefined,resSipUserData);
        }

    }).catch(function (errSipUserData) {
        callback(errSipUserData,undefined);
    });
};

var InboxMessageSender = function (req,callback) {


    if(!req.user || !req.user.company || !req.user.tenant)
    {
        callback(new Error("Invalid company information found"),null);
    }
    else
    {
        var companyInfo = req.user.tenant+":"+req.user.company;
        var messageData =
            {
                message:req.body.Message,
                msgType:"NOTIFICATION",
                heading:req.headers.eventname,
                from:req.body.From,
                issuer:req.user.iss
            }


        var httpUrl = util.format('http://interactions.app.veery.cloud/DVP/API/1.0.0.0/Inbox/Message' );
        var options = {
            url: httpUrl,
            method: 'POST',
            json: messageData,
            headers:
                {
                    'authorization':"bearer "+token,
                    'CompanyInfo':companyInfo
                }

        };

        try
        {
            httpReq(options, function (error, response, body) {


                if(error)
                {
                    console.log("Messages sending failed to inbox");
                    callback(error,null);
                }
                else
                {
                    if(response.statusCode == 200 && body && body.IsSuccess)
                    {
                          console.log("Message sent to inbox successfully");
                            callback(null,body.CustomMessage);

                    }
                    else
                    {
                        console.log("Error in sending messages to Inbox");
                        callback(response.body,null);

                    }
                }


            });
        }
        catch (ex) {
            callback(ex,undefined);


        }
    }





}

module.exports.ServerPicker = ServerPicker;
module.exports.PersistenceMessageRecorder = PersistenceMessageRecorder;
module.exports.GetPersistenceMessages = GetPersistenceMessages;
module.exports.PersistenceMessageRemover = PersistenceMessageRemover;
module.exports.PersistenceGroupMessageRecorder = PersistenceGroupMessageRecorder;
module.exports.PersistencePubSubMessageRecorder = PersistencePubSubMessageRecorder;
module.exports.GoogleNotificationKeyPicker = GoogleNotificationKeyPicker;
module.exports.GCMRegistrator = GCMRegistrator;
module.exports.ClientServerPicker = ClientServerPicker;
module.exports.SipUserDetailsPicker = SipUserDetailsPicker;
module.exports.InboxMessageSender = InboxMessageSender;
module.exports.GCMKeyRemover = GCMKeyRemover;
module.exports.RemoveAllPersistenceMessages = RemoveAllPersistenceMessages;
