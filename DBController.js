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
        Topic:topic
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

    DbConn.PersistenceMessages.findall({where:[{To:clientID}]}).then(function (resMessages) {
        callback(undefined,resMessages);
    }).catch(function (errMessages) {
        callback(errMessages,undefined);
    })

};

QueuedMessagesSender = function (messageObj,callback) {

    for(var i=0; i<messageObj.length ; i++)
    {

    }

};


module.exports.ServerPicker = ServerPicker;
module.exports.PersistenceMessageRecorder = PersistenceMessageRecorder;
module.exports.QueuedMessagesPicker = QueuedMessagesPicker;