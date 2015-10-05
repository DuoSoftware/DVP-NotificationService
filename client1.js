/**
 * Created by Pawan on 10/5/2015.
 */
var io = require('socket.io-client');
var socket = io('http://localhost:8081');
var config=require('config');

socket.on('connect', function(){

    console.log("Connected");
    //socket.emit('userID','usr001');

});

socket.on('message', function(data){
    console.log('new message recieved from '+socket.id);
    socket.emit('reply',"message1 from user1");
   // socket.emit('reply',"this is a reply 2");
    //socket.disconnect();
});
socket.on('news', function(data){
    console.log(data);
    socket.disconnect();
});
socket.on('userID',function()
{
    socket.emit('user','user1');
});