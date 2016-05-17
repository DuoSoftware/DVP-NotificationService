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

GoogleNotificationKeyPicker = function (clientID) {
    var key="APA91bG7UfSaElvcGpu1T_apJTvKPeyrRCaY36OEb_K3_5V5DvYFN9HWBuxR1w0kc5KqiXAJjL9FGYOTGIaJ_Q4TORbJeSzl3xpEI7ep5BxMPSvW9vJ_80OfiJ4oytfUb9I_Y4WUftYmhZW9uetNBFyhGxLd0YcOqQ";
    return key;

};

module.exports.ServerPicker = ServerPicker;
module.exports.PersistenceMessageRecorder = PersistenceMessageRecorder;
module.exports.QueuedMessagesPicker = QueuedMessagesPicker;
module.exports.PersistenceMessageRemover = PersistenceMessageRemover;
module.exports.PersistenceGroupMessageRecorder = PersistenceGroupMessageRecorder;
module.exports.PersistencePubSubMessageRecorder = PersistencePubSubMessageRecorder;