/**
 * Created by Pawan on 4/24/2016.
 */
var config=require('config');
var clientSDK= require('./ClientSDK/ClientSDK.js');
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkdW9vd25lciIsImp0aSI6ImNkMDE2NTMxLTE4MzUtNGNiNi04MzgxLTViZWU1OTIwOWZmYiIsInN1YiI6IkFjY2VzcyBjbGllbnQiLCJleHAiOjE0NzM2NjQ1MzksInRlbmFudCI6MSwiY29tcGFueSI6MTAzLCJhdWQiOiJteWFwcCIsImNvbnRleHQiOnsidmVlcnlhY2NvdW50Ijp7ImNvbnRhY3QiOiJzdWtpdGhhQGR1by5tZWRpYTEudmVlcnkuY2xvdWQiLCJkaXNwbGF5IjoiOTU3MCIsInZlcmlmaWVkIjp0cnVlLCJ0eXBlIjoic2lwIn19LCJzY29wZSI6W3sicmVzb3VyY2UiOiJteU5hdmlnYXRpb24iLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6Im15VXNlclByb2ZpbGUiLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6Im5vdGlmaWNhdGlvbiIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJzaXB1c2VyIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6ImNvbnRleHQiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiZW5kdXNlciIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJudW1iZXIiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoibGltaXQiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSJdfSx7InJlc291cmNlIjoic3lzbW9uaXRvcmluZyIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJEaXNwYXRjaCIsImFjdGlvbnMiOlsid3JpdGUiXX0seyJyZXNvdXJjZSI6ImRhc2hib2FyZGV2ZW50IiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6ImRhc2hib2FyZGdyYXBoIiwiYWN0aW9ucyI6WyJyZWFkIl19LHsicmVzb3VyY2UiOiJmaWxlc2VydmljZSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIl19LHsicmVzb3VyY2UiOiJhcHByZWciLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSJdfSx7InJlc291cmNlIjoiY2FsbHJ1bGUiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidHJ1bmsiLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6InF1ZXVlbXVzaWMiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiY2RyIiwiYWN0aW9ucyI6WyJyZWFkIl19LHsicmVzb3VyY2UiOiJleHRlbnNpb24iLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSJdfSx7InJlc291cmNlIjoiY29uZmVyZW5jZSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJwYnhhZG1pbiIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJwYnh1c2VyIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InNjaGVkdWxlIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6ImFwcG9pbnRtZW50IiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6ImNsdXN0ZXIiLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6InRlbXBsYXRlIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InRyaWdnZXJzIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InVzZXJHcm91cCIsImFjdGlvbnMiOlsicmVhZCJdfSx7InJlc291cmNlIjoiYXJkc3JlcXVlc3QiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoicmVxdWVzdG1ldGEiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoicXVldWUiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoicmVxdWVzdHNlcnZlciIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsiYWN0aW9ucyI6W119LHsicmVzb3VyY2UiOiJhdHRyaWJ1dGUiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiZ3JvdXAiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiYXJkc3Jlc291cmNlIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InJlc291cmNldGFza2F0dHJpYnV0ZSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJ0YXNrIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InByb2R1Y3Rpdml0eSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJTaGFyZWQiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidGFza2luZm8iLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidXNlciIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJ1c2VyUHJvZmlsZSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJvcmdhbmlzYXRpb24iLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSJdfSx7InJlc291cmNlIjoicmVzb3VyY2UiLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6InBhY2thZ2UiLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6ImNvbnNvbGUiLCJhY3Rpb25zIjpbInJlYWQiXX0seyJyZXNvdXJjZSI6InVzZXJTY29wZSIsImFjdGlvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl19LHsicmVzb3VyY2UiOiJ1c2VyQXBwU2NvcGUiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidXNlck1ldGEiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoidXNlckFwcE1ldGEiLCJhY3Rpb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfSx7InJlc291cmNlIjoiY2xpZW50IiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6ImNsaWVudFNjb3BlIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX1dLCJpYXQiOjE0NzMwNTk3Mzl9.C63GBi0SHPdFhnaXcD0-wqawh4aDuzSFQse6ogVDUqA";
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