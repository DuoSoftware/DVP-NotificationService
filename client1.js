/**
 * Created by Pawan on 10/5/2015.
 */
var readline = require('readline');
var config=require('config');
var io = require('socket.io-client');
var Sport;
var Sip;
var clentID;

var path=ConfigCollector(1);
//console.log(path);

    //var socket = io(path, { query: clentID });



//console.log('http://'+Sip+':'+Sport);


//var redisManager=require('./RedisManager.js');

/*socket.on('connect', function(){

    console.log("Connected");
    //socket.emit('userID','usr001');

});
*/
/*
socket.on('message', function(data){
var rep="";
    var TopicKey=data.TopicKey;
    var Message=data.Message;


    console.log('new message recieved from '+socket.id);
    console.log("Message "+Message);
    console.log('Message received Send Your reply : ');
    rl.prompt();

    rl.on('line', function(line) {

        rep=line;
        var MsgObj={message:rep,Tkey:TopicKey};
        socket.emit('reply',MsgObj);

    });






    // socket.emit('reply',"this is a reply 2");
    //socket.disconnect();
});
socket.on('news', function(data){
    console.log(data);
    socket.disconnect();
});
*/


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
        var r2 = readline.createInterface(process.stdin, process.stdout);
        console.log("Closing "+clentID);
        //var IP="http://"+Sip+":"+Sport;
        var fakeip="http://notificationservice.104.131.67.21.xip.io";
        var socket = io(fakeip, { query: "myid="+clentID });


         socket.on('message', function(data){
         var rep="";
         var TopicKey=data.TopicKey;
         var Message=data.Message;


         console.log('new message recieved from '+socket.id);
         console.log("Message "+Message);
         console.log('Message received Send Your reply : ');
         r2.prompt();

         r2.on('line', function(line) {

         rep=line;
         var MsgObj={Message:rep,Tkey:TopicKey};
             console.log(MsgObj.Message);
         socket.emit('reply',MsgObj);
            // console.log(MsgObj.message);

         });






         // socket.emit('reply',"this is a reply 2");
         //socket.disconnect();
         });
         socket.on('news', function(data){
         console.log(data);
         socket.disconnect();
         });


        //socket= io('http://'+Sip+':'+Sport, { query: clentID });
        //process.exit(0);
    });
}