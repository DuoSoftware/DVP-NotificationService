/**
 * Created by Pawan on 10/5/2015.
 */
/**
 * Created by Pawan on 10/5/2015.
 */
var io = require('socket.io-client');
var socket = io('http://localhost:8081', { query: "myid=cli_002" });
var config=require('config');

socket.on('connect', function(){

    console.log("Connected");

});

socket.on('message', function(data){
    console.log('new message recieved from '+socket.id);
    socket.emit('reply',"message2 from user2");
    //socket.emit('reply',"this is a reply 4");
    //socket.disconnect();
});
socket.on('news', function(data){
    console.log(data);
    socket.disconnect();
});

/*socket.on('userID',function()
{
    socket.emit('user','user2');
});
    */