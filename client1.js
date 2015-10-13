/**
 * Created by Pawan on 10/5/2015.
 */
var io = require('socket.io-client');
var socket = io('http://localhost:8081', { query: "myid=cli_001" });
var config=require('config');
//var redisManager=require('./RedisManager.js');

/*socket.on('connect', function(){

    console.log("Connected");
    //socket.emit('userID','usr001');

});
*/

socket.on('message', function(data){

    var TopicKey=data.TopicKey;
    var Message=data.Message;

   /* redisManager.SocketFinder(TopicKey,function(errRedis,resRedis)
    {
        if(errRedis)
        {
            console.log(errRedis);
        }
        else
        {
            console.log(resRedis[1]);
        }
    });
    */
    console.log('new message recieved from '+socket.id);

    console.log("Message "+Message);
    var MsgObj={message:"Message fromC Client",Tkey:TopicKey};
    socket.emit('reply',MsgObj);
    // socket.emit('reply',"this is a reply 2");
    //socket.disconnect();
});
socket.on('news', function(data){
    console.log(data);
    socket.disconnect();
});
/*socket.on('userID',function()
{
    socket.emit('user','user1');
});
    */