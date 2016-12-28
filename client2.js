/**
 * Created by Pawan on 4/24/2016.
 */
var config=require('config');
var clientSDK= require('./ClientSDK/ClientSDK.js');
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkdW9jaGFuZGFuYSIsImp0aSI6IjdmMDlhNmU1LTZhY2UtNDhkOS05Yjg1LTYwYTlhMzMwOTI4ZSIsInN1YiI6IkFjY2VzcyBjbGllbnQiLCJleHAiOjE0NzcyOTAzNjksInRlbmFudCI6MSwiY29tcGFueSI6MTAzLCJhdWQiOiJteWFwcCIsImNvbnRleHQiOnsicmVzb3VyY2VpZCI6IjY2IiwidmVlcnlhY2NvdW50Ijp7InR5cGUiOiJzaXAiLCJ2ZXJpZmllZCI6dHJ1ZSwiZGlzcGxheSI6Ijk1MDgiLCJjb250YWN0IjoiYWJjZEBkdW8ubWVkaWExLnZlZXJ5LmNsb3VkIn19LCJzY29wZSI6W3sicmVzb3VyY2UiOiJteU5hdmlnYXRpb24iLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6Im15VXNlclByb2ZpbGUiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiYXJkc3Jlc291cmNlIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6Im5vdGlmaWNhdGlvbiIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJzaXB1c2VyIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InRpY2tldHZpZXciLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidGlja2V0IiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6ImV2ZW50cyIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJleHRlcm5hbFVzZXIiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidXNlckdyb3VwIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InVzZXIiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiZW5nYWdlbWVudCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJpbmJveCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJ0YWciLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidGltZXIiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiZm9ybXMiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoicmVxdWVzdG1ldGEiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoic3lzbW9uaXRvcmluZyIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJmaWxlc2VydmljZSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJkYXNoYm9hcmRldmVudCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJkYXNoYm9hcmRncmFwaCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJwcm9kdWN0aXZpdHkiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoic29jaWFsIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX1dLCJpYXQiOjE0NzY2ODU1Njl9.oLels7zVWDEsKVvofm4AgH75IhHRUDPl5swbqJQ8hfo";
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
function  onBroadcastMessageReceived(reason)
{
    console.log("Broadcast message received "+JSON.stringify(reason));
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
        onBroadcastMessageReceived:onBroadcastMessageReceived


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