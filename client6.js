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
    console.log("AgentFound "+reason);
};
function  onAgentConnected(reason)
{
    console.log("Agent Conneccted "+reason);
};
function  onAgentDisconnected(reason)
{
    console.log("Agent Disconnected "+reason);
};



function onClientdetailsRecieved(Data)
{
    ClientID=Data;
    console.log("ClientID "+ClientID);
}

var configOptions =
{
    URL:"http://notificationservice.104.131.67.21.xip.io",
    Callbacks:{
        onDisconnected:onDisconnected,
        onMessageReceived:onMessageReceived,
        onAgentFound:onAgentFound,
        onAgentConnected:onAgentConnected,
        onAgentDisconnected:onAgentDisconnected,
        onClientdetailsRecieved:onClientdetailsRecieved

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