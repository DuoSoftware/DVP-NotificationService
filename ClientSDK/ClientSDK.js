/**
 * Created by Pawan on 4/24/2016.
 */

var io = require('socket.io-client');
var config=require('config');

var host = config.Host.domain;
var hport=config.Host.port;
var version = config.Host.version;

var socketObj ={};
var socket;
var ClientID;
var AgentEventStatus=false;

function  ClientConfiguration(eventObj,jwt)
{
    console.log(eventObj.URL);
    socket = io.connect(eventObj.URL);


    socketObj.onDisconnected = eventObj.Callbacks.onDisconnected;
    socketObj.onMessageReceived = eventObj.Callbacks.onMessageReceived;
    socketObj.onBroadcastMessageReceived = eventObj.Callbacks.onBroadcastMessageReceived;
    socketObj.onPublishMessageReceived = eventObj.Callbacks.onPublishMessageReceived;
    socketObj.agent_found=eventObj.Callbacks.onAgentFound;
    socketObj.agent_connected=eventObj.Callbacks.onAgentConnected;
    socketObj.agent_disconnected=eventObj.Callbacks.onAgentDisconnected;
    socketObj.agent_rejected=eventObj.Callbacks.onAgentRejected;
    socketObj.onClientdetailsRecieved=eventObj.Callbacks.onClientdetailsRecieved;

    socketObj.conference_create=eventObj.Callbacks.onConferenceCreate;
    socketObj.conference_destroy=eventObj.Callbacks.onConferenceDestroy;
    socketObj.conference_member_joined=eventObj.Callbacks.onConferenceMemberJoined;
    socketObj.conference_member_left=eventObj.Callbacks.onConferenceMemberLeft;
    socketObj.conference_member_status=eventObj.Callbacks.onConferenceMemberStatus;
    socketObj.conference_user_assigned=eventObj.Callbacks.onConferenceUserAdded;

    socket
        .on('authenticated', function () {
            //do other things
        })
        .emit('authenticate', {token: jwt});

    socket.on('clientdetails', function (data) {

        if(socketObj.onClientdetailsRecieved)
        {
            socketObj.onClientdetailsRecieved(data);
        }

    });

    socket.on('disconnect', function(reason)
    {
        if(socketObj.onDisconnected)
        {
            socketObj.onDisconnected(reason);
        }

    });

    socket.on('message', function(reason)
    {
        if(socketObj.onMessageReceived);
        {
            socketObj.onMessageReceived(reason);
        }


    });

    socket.on('broadcast', function(data){
        if(socketObj.onBroadcastMessageReceived)
        {
            socketObj.onBroadcastMessageReceived(data);
        }

        //socket.disconnect();
    });

    socket.on('publish', function(data){
        if(socketObj.onPublishMessageReceived)
        {
            socketObj.onPublishMessageReceived(data);
        }

        //socket.disconnect();
    });

    socket.on('agent_found', function (data) {
        if(socketObj.agent_found)
        {
            socketObj.agent_found(data);
        }

    });
    socket.on('agent_connected', function (data) {
        if(socketObj.agent_connected);
        {
            socketObj.agent_connected(data);
        }

    });
    socket.on('agent_disconnected', function (data) {
        if(socketObj.agent_disconnected)
        {
            socketObj.agent_disconnected(data);
        }

    });
    socket.on('agent_rejected', function (data) {
        if(socketObj.agent_rejected)
        {
            socketObj.agent_rejected(data);
        }


    });
    socket.on('conference_create', function (data) {
        if(socketObj.conference_create)
        {
            socketObj.conference_create(data);
        }

    });
    socket.on('conference_destroy', function (data) {
        if(socketObj.conference_destroy(data))
        {
            socketObj.conference_destroy(data);
        }

    });
    socket.on('conference_member_joined', function (data) {
        if(socketObj.conference_member_joined)
        {
            socketObj.conference_member_joined(data);
        }

    });
    socket.on('conference_member_left', function (data) {
        if(socketObj.conference_member_left)
        {
            socketObj.conference_member_left(data);
        }

    });
    socket.on('conference_member_status', function (data) {
        if(socketObj.conference_member_status)
        {
            socketObj.conference_member_status(data);
        }

    });
    socket.on('conference_user_assigned', function (data) {
        if(socketObj.conference_user_assigned)
        {
            socketObj.conference_user_assigned(data);
        }
    });


}

function  SendReply(Message,topicKey)
{
    var msgObj={Message:Message,Tkey:topicKey};
    socket.emit('reply',msgObj);
}


function  SubscribeToEvent (QuertyOptions,ClientID,callback)
{
    var msgObj= SubscribeDataObjectCreator(QuertyOptions.queryObj,QuertyOptions.filterData,QuertyOptions.rangeData);
    //socket.emit('subscribe',msgObj);
    var ServerIP=host;
    var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/Subscribe/%s', ServerIP,version,ClientID);
    var options = {
        url : httpUrl,
        method : 'POST',
        json : msgObj

    };

    httpReq(options, function (error, response, body)
    {
        if (!error && response.statusCode == 200)
        {
            console.log("no errrs in request 200 ok");
            //callback(undefined,response.statusCode);
            callback(undefined,response.statusCode);

        }
        else
        {
            console.log("errrs in request  "+error);
            callback(error,undefined);
            //callback(error,undefined);

        }
    });



};

module.exports.ClientConfiguration = ClientConfiguration;
module.exports.SendReply = SendReply;
module.exports.SubscribeToEvent = SubscribeToEvent;