var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('./index.html');
});

var MainRoom="MainRoom";


io.on('connection', function(socket){
  socket.join(MainRoom);
  socket.room = MainRoom;
  io.to(socket.room).emit('event','Anon user joined '+socket.room+'...');


 socket.on('setUsername', function(data){
    console.log('setUsername to: ' + data);
    socket.username = data;
    io.to(socket.room).emit('event','user joined with username: '+socket.username);
 });

socket.on('msg', function(msg){
    console.log('message: ' + msg);
    io.to(socket.room).emit('msgFront',socket.username+'>'+msg);
  });

socket.on('joinRoom', function(room){

  socket.join(room);
  socket.room = room;
  io.to(socket.room).emit('event',socket.username+" joined "+socket.room+"!");
  
  });
  
socket.on('createRoom', function(room){
	console.log("roomCreated ="+room);
  
  socket.leave(MainRoom);//à discuter 
  socket.join(room);
 
  
  socket.room = room;
  io.emit('createdRoom',socket.room);
  
  });
  
  socket.on('getAllRooms', function(){
    rooms = io.sockets.adapter.rooms;
  
     io.to(MainRoom).send('showRooms',JSON.stringify(rooms));
  });


socket.on('disconnect', function(){
    console.log('user disconnected');
     io.to(socket.room).emit('event',socket.username+"> I'm gone! bye!");
  });

});





http.listen(3000, function(){
  console.log('listening on *:3000');
});
