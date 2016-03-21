/**
 * Created by Pawan on 3/21/2016.
 */

var socketObj ={};
var socket;
function ConfigClient (io,clientID,serverIp,serverPort,onDisconnect,onMessage,onBroadcast,onPublish,onReply)
{
    var serverLoc= serverIp+":"+serverPort;
    socket = io(serverLoc, { query: "myid="+clientID , 'forceNew': true, reconnect: false });

    socketObj.onDisconnect=onDisconnect;
    socketObj.onMessage=onMessage;
    socketObj.onBroadcast=onBroadcast;
    socketObj.onPublish=onPublish;
    socketObj.onReply=onReply;


    socket.on('disconnect', function(reason)
    {
        socketObj.onDisconnect(reason);
        if(reason != "io server disconnect")
        {
            console.log("Disconnecting "+reason +" Reconnecting");

            //socket = io(IP, { query: "myid="+clentID });
            //socket.connect();
        }
        else
        {
            console.log("Disconnect request from server.Disconnecting "+reason );
            //socket = io(IP, { query: "myid="+clentID });
            //socket.connect();
        }

        //
    });

    socket.on('message', function(data){
        //socket.disconnect();


        var rep="";
        var TopicKey=data.TopicKey;
        var Message=data.Message;
        var MsgObj="";
        var count=0;


        console.log('new message recieved from '+socket.id);
        console.log("Message "+Message);
        console.log('Message received Send Your reply : ');
        socketObj.onMessage(data);



    });
    socket.on('broadcast', function(data){
        console.log(data);
        socketObj.onBroadcast(data);
        //socket.disconnect();
    });
    socket.on('publish', function(data){
        console.log(data);
        socketObj.onPublish(data);
        //socket.disconnect();
    });

}

function SendReply(Message,topicKey)
{
    var msgObj={Message:Message,Tkey:topicKey};
    socket.emit('reply',msgObj);
};

function  SubscribeToEvent (queryObj,filterData,rangeData,callbackURL)
{
                var msgObj= SubscribeDataObjectCreator(queryObj,filterData,rangeData,callbackURL);
                socket.emit('subscribe',msgObj);


};

function GetQueryData (callback)
{

}

function SubscribeDataObjectCreator (quaryObj,filterData,rangeData,callbackURL)
{
    var subObj =
    {
        Query : {
            QueryId:quaryObj.id,
            Query:quaryObj.Query,
            FilterBy:filterData,
            RangeBy:rangeData
        },
        RefId : "",
        CallbackURL:callbackURL
    };

    return subObj;
}