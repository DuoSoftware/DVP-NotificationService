/**
 * Created by Pawan on 4/24/2016.
 */
var config=require('config');
var clientSDK= require('./ClientSDK/ClientSDK.js');
var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiMTdmZTE4M2QtM2QyNC00NjQwLTg1NTgtNWFkNGQ5YzVlMzE1Iiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJjbGllbnQiOiIxIiwiZXhwIjoxODkzMzAyNzUzLCJ0ZW5hbnQiOjEsImNvbXBhbnkiOjMsInNjb3BlIjpbeyJyZXNvdXJjZSI6ImFsbCIsImFjdGlvbnMiOiJhbGwifV0sImlhdCI6MTQ2MTI5OTE1M30._M8u4ElZESTdJtkQSEtr58kE97s0KiHeIaeWsoVc8Ho";
var ClientID;
var TopiCData;

function  onDisconnected(reason)
{
    console.log("Disconnected "+reason);
};

function  onMessageReceived(Data)
{
    console.log("New Message "+JSON.stringify(Data));
    TopiCData=Data.TopicKey;

    //clientSDK.SendReply('myReply',TopiCData);

};
function  onAgentFound(reason)
{
    console.log("Agent Found "+JSON.stringify(reason));
};
function  onAgentConnected(reason)
{
    console.log("Agent Connected "+JSON.stringify(reason));
};
function  onAgentDisconnected(reason)
{
    console.log("Agent Disconnected "+JSON.stringify(reason));
};
function  onAgentRejected(reason)
{
    console.log("Agent Rejected "+JSON.stringify(reason));
};



function onClientdetailsRecieved(Data)
{
    ClientID=Data;
    console.log("ClientID "+ClientID);
}

function  onConferenceCreate(reason)
{
    console.log("ConferenceCreate "+JSON.stringify(reason));
};

function  onConferenceDestroy(reason)
{
    console.log("ConferenceDestroy "+JSON.stringify(reason));
};

function  onConferenceMemberJoined(reason)
{
    console.log("ConferenceMemberJoined "+JSON.stringify(reason));
};

function  onConferenceMemberLeft(reason)
{
    console.log("ConferenceMemberLeft "+JSON.stringify(reason));
};

function  ConferenceMemberStatus(reason)
{
    console.log("ConferenceMemberStatus "+JSON.stringify(reason));
};


var configOptions =
{
    URL:"http://127.0.0.1:8089",
    Callbacks:{
        onDisconnected:onDisconnected,
        onMessageReceived:onMessageReceived,
        onAgentFound:onAgentFound,
        onAgentConnected:onAgentConnected,
        onAgentDisconnected:onAgentDisconnected,
        onClientdetailsRecieved:onClientdetailsRecieved,
        onAgentRejected:onAgentRejected,
        onConferenceCreate:onConferenceCreate,
        onConferenceDestroy:onConferenceDestroy,
        onConferenceMemberJoined:onConferenceMemberJoined,
        onConferenceMemberLeft:onConferenceMemberLeft,
        ConferenceMemberStatus:ConferenceMemberStatus,


    },
    jwt:token

};

function  startConfig()
{
    console.log("statred");
    clientSDK.ClientConfiguration(configOptions, token);
}

var QueryOptions =
{
    queryObj:{
        "QueryId":"1",
        "Query":"select * from Agents"
    },
    filterData:"Company=1,Tenant=3",
    rangeData:"AnswerCount>1000"


}
function SubscribeClient(QueryOptions)
{
    clientSDK.SubscribeToEvent(QueryOptions,1, function (e,r) {

    });
}



startConfig();