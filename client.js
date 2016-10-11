/**
 * Created by Pawan on 4/24/2016.
 */
var config=require('config');
var clientSDK= require('./ClientSDK/ClientSDK.js');
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkdW9hcmFmYXRoIiwianRpIjoiNzFlZTFkYWQtYzI5NC00NmEyLTk2MGItNDI1Zjk5ODUyOWE2Iiwic3ViIjoiQWNjZXNzIGNsaWVudCIsImV4cCI6MTQ3NjY5OTU0NSwidGVuYW50IjoxLCJjb21wYW55IjoxMDMsImF1ZCI6Im15YXBwIiwiY29udGV4dCI6eyJyZXNvdXJjZWlkIjoiNDkiLCJ2ZWVyeWFjY291bnQiOnsiY29udGFjdCI6Ijk1MDJAZHVvLm1lZGlhMS52ZWVyeS5jbG91ZCIsImRpc3BsYXkiOiI5NTAyIiwidmVyaWZpZWQiOnRydWUsInR5cGUiOiJzaXAifX0sInNjb3BlIjpbeyJyZXNvdXJjZSI6Im15TmF2aWdhdGlvbiIsImFjdGlvbnMiOlsicmVhZCJdfSx7InJlc291cmNlIjoibXlVc2VyUHJvZmlsZSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJhcmRzcmVzb3VyY2UiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoibm90aWZpY2F0aW9uIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InNpcHVzZXIiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoicmVxdWVzdG1ldGEiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoic3lzbW9uaXRvcmluZyIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJteVVzZXJQcm9maWxlIiwiYWN0aW9ucyI6WyJyZWFkIl19LHsicmVzb3VyY2UiOiJwYWNrYWdlIiwiYWN0aW9ucyI6WyJyZWFkIl19LHsicmVzb3VyY2UiOiJldmVudHMiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiZXh0ZXJuYWxVc2VyIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InVzZXJHcm91cCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJ0aWNrZXQiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidGFnIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InRpbWVyIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InRpY2tldHZpZXciLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiZm9ybXMiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiZW5nYWdlbWVudCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJpbmJveCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJ1c2VyIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InByb2R1Y3Rpdml0eSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJkYXNoYm9hcmRldmVudCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJkYXNoYm9hcmRncmFwaCIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19XSwiaWF0IjoxNDc2MDk0NzQ1fQ.jfr4bV0DGl877I2XMmGGwK4ygI2DDnlgwV_L2eRox8o";
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
    URL:"http://notificationservice.app.veery.cloud",
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