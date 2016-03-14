/**
 * Created by Pawan on 10/5/2015.
 */
var readline = require('readline');
var config=require('config');
var io = require('socket.io-client');
var util = require('util');
var validator=require('validator');

var Sport;
var Sip;
var clentID;
var Tokens=new Array();



var path=ConfigCollector(1);

function ConfigCollector(status)
{
    var rl = readline.createInterface(process.stdin, process.stdout);
    console.log('Please enter IP');
    rl.prompt();

    rl.on('line', function(line) {


        if(status==1)
        {
            Sip= line;
            console.log(Sip);
            status++;
            console.log('Please enter Port');
            rl.prompt();
        }
        else if(status==2)
        {
            Sport=line;
            console.log(Sport);
            status++;
            console.log('Please enter clientID');
            rl.prompt();

            //process.exit(0);
            // process.exit(0);

        }
        else
        {
            clentID=line;
            status++;
            rl.close();
        }



        //var MsgObj={message:rep,Tkey:TopicKey};
        //socket.emit('reply',MsgObj);

    }).on('close',function(){
        //logger.debug('[DVP-HTTPProgrammingAPIDEBUG] - [%s] - [READLINE] - Read line closed ');

        console.log("Closing "+clentID);
        var IP="http://"+Sip;
        if(validator.isIP(Sip))
        {
            IP="http://"+Sip+":"+Sport;
        }
        //var fakeip="http://notificationservice.104.131.67.21.xip.io";

        console.log("====================================");

        var socket = io(IP, { query: "myid="+clentID , 'forceNew': true, reconnect: false });

        socket.on('disconnect', function(reason)
        {
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

            var r2 = readline.createInterface(process.stdin, process.stdout);
            console.log("meeee");
            var rep="";
            var TopicKey=data.TopicKey;
            var Message=data.Message;
            var MsgObj="";
            var count=0;


            console.log('new message recieved from '+socket.id);
            console.log("Message "+Message);
            console.log('Message received Send Your reply : ');
            r2.prompt();

            r2.on('line', function(line) {

                rep=line;

                MsgObj={Message:rep,Tkey:TopicKey};
                console.log(count+1);
                console.log(MsgObj.Message);
                socket.emit('reply',MsgObj);
                r2.close();


            });


        });
        socket.on('broadcast', function(data){
            console.log(data);
            //socket.disconnect();
        });
        socket.on('publish', function(data){
            console.log(data);
            //socket.disconnect();
        });


    });
}