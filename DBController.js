/**
 * Created by Pawan on 2/24/2016.
 */
var DbConn = require('dvp-dbmodels');

ServerPicker = function (SID,callback) {

    DbConn.NotificationServer.find({where:{id:SID}}).then(function (resServ) {

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

PersistenceMessageRecorder = function (Obj,callback) {

    var dataBody=Obj.body;
    var topic="";
    if(Obj.params.Topic)
    {
        topic=Obj.params.Topic;
    }

    console.log("Topic "+topic);

    var CallbackObj = {

        Timeout:dataBody.Timeout,
        Message:dataBody.Message,
        Ref:dataBody.Ref,
        Direction:dataBody.Direction,
        Topic:topic,
        CallbackURL : dataBody.Callback
    };
    try {
        var newMessageObject = DbConn.PersistenceMessages
            .build(
            {
                From : dataBody.From,
                To : dataBody.To,
                Time : Date.now(),
                Callback:JSON.stringify(CallbackObj)

            }
        )
    }
    catch (e)
    {
        callback(e,undefined);
    }

    newMessageObject.save().then(function (resSave) {
        callback(undefined,resSave)
    }).catch(function (errSave) {
        callback(errSave,undefined);
    });
};

QueuedMessagesPicker = function (clientID,callback) {

    DbConn.PersistenceMessages.findAll({where:{To:clientID}}).then(function (resMessages)
    {
        callback(undefined,resMessages);

    }).catch(function (errMessages)
    {
        callback(errMessages,undefined);
    });

};

PersistenceMessageRemover = function (msgId,callback) {

    DbConn.PersistenceMessages.destroy({where:{id:msgId}}).then(function (resRem) {
        callback(undefined,resRem);
    }).catch(function (errRem) {
        callback(errRem,undefined);
    });
};

PersistenceGroupMessageRecorder = function (Obj,callback) {


    var dataBody=Obj;
    console.log("To Db of records "+dataBody);


    var CallbackObj = {

        Timeout:dataBody.Timeout,
        Message:dataBody.Message,
        Ref:dataBody.Ref,
        Direction:dataBody.Direction,
        Topic:"",
        CallbackURL : ""
    };

    console.log("Saving "+CallbackObj);
    try {
        var newMessageObject = DbConn.PersistenceMessages
            .build(
            {
                From : dataBody.From,
                To : dataBody.To,
                Time : Date.now(),
                Callback:JSON.stringify(CallbackObj)

            }
        )
    }
    catch (e)
    {
        callback(e,undefined);
    }

    newMessageObject.save().then(function (resSave) {
        callback(undefined,resSave)
    }).catch(function (errSave) {
        callback(errSave,undefined);
    });
};



module.exports.ServerPicker = ServerPicker;
module.exports.PersistenceMessageRecorder = PersistenceMessageRecorder;
module.exports.QueuedMessagesPicker = QueuedMessagesPicker;
module.exports.PersistenceMessageRemover = PersistenceMessageRemover;
module.exports.PersistenceGroupMessageRecorder = PersistenceGroupMessageRecorder;