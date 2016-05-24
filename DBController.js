/**
 * Created by Pawan on 2/24/2016.
 */
var DbConn = require('dvp-dbmodels');

ServerPicker = function (SID,callback) {

    console.log("Hitaa");
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

PersistenceMessageRecorder = function (Obj,callback) {

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
        callback(e,undefined);
    }
};

QueuedMessagesPicker = function (clientID,callback) {

    try {
        DbConn.PersistenceMessages.findAll({where: {To: clientID}}).then(function (resMessages) {
            callback(undefined, resMessages);

        }).catch(function (errMessages) {
            callback(errMessages, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }

};

PersistenceMessageRemover = function (msgId,callback) {

    try {
        DbConn.PersistenceMessages.destroy({where: {id: msgId}}).then(function (resRem) {
            callback(undefined, resRem);
        }).catch(function (errRem) {
            callback(errRem, undefined);
        });
    } catch (e) {
        callback(e,undefined);
    }
};

PersistenceGroupMessageRecorder = function (Obj,callback) {

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

PersistencePubSubMessageRecorder = function (Obj,clientID,callback) {

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

GCMRegistrator = function (clientID,regKey,res) {

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
            res.end("Success");

        }).catch(function (errSave) {
            console.log("GCM record insertion failed");
            res.end(JSON.stringify(errSave));
        });
    } catch (ex) {
        console.log("Exception in GCM Recorder");
        res.end(JSON.stringify(ex));
    }


};

GoogleNotificationKeyPicker = function (clientID,callback) {

    DbConn.GCMKeys.findAll({attributes: ['GCMKey'],where:{ClientID:clientID}}).then(function (resKeys) {

        console.log("key : "+resKeys.GCMKey);
        if(resKeys)
        {
            var GCMkeys=[];
            for(var i=0;i<resKeys.length;i++)
            {
                GCMkeys[i]=resKeys[i].GCMKey;
                if(i==resKeys.length-1)
                {
                    callback(undefined,GCMkeys)
                }
            }

        }
        else
        {
            console.log("Key not found");
            callback("Key not found",undefined);

        }

    }).catch(function (errKeys) {
        console.log("Error in key searching ",errKeys);
        callback("Error in key searching "+errKeys,undefined);
    });



};

module.exports.ServerPicker = ServerPicker;
module.exports.PersistenceMessageRecorder = PersistenceMessageRecorder;
module.exports.QueuedMessagesPicker = QueuedMessagesPicker;
module.exports.PersistenceMessageRemover = PersistenceMessageRemover;
module.exports.PersistenceGroupMessageRecorder = PersistenceGroupMessageRecorder;
module.exports.PersistencePubSubMessageRecorder = PersistencePubSubMessageRecorder;
module.exports.GoogleNotificationKeyPicker = GoogleNotificationKeyPicker;
module.exports.GCMRegistrator = GCMRegistrator;