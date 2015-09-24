// modules =================================================
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('mongoose');
var methodOverride = require('method-override');

var passport = require('passport');
var flash = require('connect-flash');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var chalk = require('chalk');

var error = chalk.bold.red;
var warn  = chalk.bold.yellow;
var fine  = chalk.bold.green;
var info  = chalk.bold.blue;

//prefixes
var prefixFrontend = __dirname + '/frontend/';
var prefixBower = __dirname + '/bower_modules';


app.use(cookieParser()); // read cookies (needed for auth)
// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({
    extended: true
})); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(prefixFrontend)); // set the static files location /public/img will be /img for users
app.use(express.static(prefixBower)); // set the static files location /public/img will be /img for users

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//boot level of the frontend side
app.get('/', function(req, res) {
    res.sendfile(prefixFrontend + 'modules/main/views/index.html');
});

//middelware that will be executed for each new connected user
io.use(function(socket, next) {
    socket.nickname = socket.request._query['nickname'];
    console.log('User with nickname ',info(socket.nickname),' has set his nickname');
    next();
});


//main room
var mainRoom = 'Main room';
//handle rooms owners list
var roomsOwners = new Object();

io.on('connection', function(socket) {

roomsOwners[socket.id] = {ownerName : socket.nickname};

console.log(info('[BEGIN] Rooms Owners :'));
console.log(roomsOwners);
console.log(info('[END] Rooms Owners'));


    /********* @pmsg *********
    Description : This event handle sending users private messages - the server will look for that user using his nickname
    Params      : msg object {message: STRING, nickname: STRING} - where the nickname is the user nickname
    receiving the message
    **********           **********/

    socket.on('pmsg', function(msg) {
        if(msg.nickname && typeof msg.nickname!= "undefined"){
            io.sockets.to(socket.room).emit('msgFront', msg);
        }else{
            io.sockets.to(socket.id).emit('msgFront', {nickname: 'ROBOT' ,message: 'You cant send message to other rooms, please join at least a room then try again!'});
        }
    });


    /********* @getRoomList *********
    Description : This event sends all rooms informations when a user connects,joins,leaves or disconnects.
    Params      : NO PARAMS
    **********           **********/

    socket.on('getRoomList', roomList);


    /********* @msg *********
    Description : This event handle sending/prodcasting users messages inside a specific room
    Params      : msg object {message: STRING, nickname: STRING} - where the nickname is the user nickname
    receiving the message
    **********           **********/

    socket.on('msg', function(msg) {
        if(socket.room && typeof socket.room!= "undefined"){
            io.sockets.to(socket.room).emit('msgFront', msg);
        }else{
            io.sockets.to(socket.id).emit('msgFront', {nickname: 'ROBOT' ,message: 'You cant send message to other rooms, please join at least a room then try again!'});
        }
    }); 

    function roomsDigest() {
      Object.keys(roomsOwners).forEach(function(roomName, owner) {
        var uselessRoom = true;
           Object.keys(io.sockets.adapter.rooms).forEach(function(sysRoomName, idsInThatRoom) {
            if(roomName==sysRoomName){
                uselessRoom = false;
            }
           });
           if(uselessRoom){
             delete roomsOwners[roomName];
             console.log(error('Useless room "',roomName,'" removed'));
           }
       });


    console.log(warn('[BEGIN] Rooms Owners  :'));
    console.log(roomsOwners);
    console.log(warn('[END] Rooms Owners '));
    }
    /********* @roomEvent *********
    Description : This event handle room join and leave and all related info
    Params      : room object {join: BOOLEAN, roomName: STRING}
    **********           **********/
    socket.on('roomEvent', function(room) {
        if (room.join == true){
            //leave the previous joined room - make sure that we join one room at the same time and it's not the default room
            if(socket.room!=room.roomName && socket.room!=socket.id){
                socket.leave(socket.room);
            }

            socket.room = room.roomName;
            //check for new room - if the room is new, set his owner to the current connected socket's nickname
            if(!roomsOwners[socket.room] && typeof roomsOwners[socket.room]==="undefined"){
                roomsOwners[socket.room] = {ownerName : socket.nickname};
            }
            socket.join(socket.room);
            console.log('User ',fine(socket.nickname),'have joined',fine(socket.room));

            //clean out unused rooms - checks if there any unused room and clean them
            roomsDigest();
        }
        else{
            if(room.roomName==socket.id){
                io.sockets.to(socket.id).emit('msgFront', {nickname: 'ROBOT' ,message: 'You cant leave your default room! Access denied.'});
                console.log(error('User ',socket.nickname,'tried to leave his default room'));
                return;
            }
            socket.leave(room.roomName);
            delete socket.room;
            console.log('User ',warn(socket.nickname),'has left',warn(room.roomName));

            //clean out unused rooms - checks if there any unused room and clean them
            roomsDigest();
        }

        roomList();
    });
    /********* @disconnect *********
    Description : This event handle user disconnection and related infos
    Params      : NO PARAMS
    **********           **********/
    socket.on('disconnect', function() {
        console.log(error('User <'+socket.nickname+'> disconnected'));
        //clean out unused rooms - checks if there any unused room and clean them
        roomsDigest();
        roomList();
    });

    function getUsersList(){
        var users = [];
        io.sockets.sockets.forEach(function(socket) {
            users.push({
                id: socket.id,
                nickname: socket.nickname
            })
        });

        return users;
    }

    function getRoomsList(){
        var rooms = [];

        Object.keys(io.sockets.adapter.rooms).forEach(function(roomName,index ,idsOfThatRoom) {
            var owner = roomsOwners[roomName].ownerName;
            var usersOfThatRoom = populateUsers(roomName);
          
            rooms.push({
                name: roomName,
                owner: owner,
                users: usersOfThatRoom
            });
        });
        return rooms;
    }

    function roomList() {
        var rooms = getRoomsList();
        
        io.emit('roomList', {
            rooms: rooms
        });
    }

    function populateUsers(roomName) {
      var populatedUsers = [];
      Object.keys(io.sockets.adapter.rooms[roomName]).forEach(function(userId, index) {
            populatedUsers.push(getUserById(userId));
                   });
      return populatedUsers;
    }

    function getUserById(id) {
      var allUsers = getUsersList();

        var ret = '';
        allUsers.forEach(function(user) {
            if (user.id == id)
                ret = user;
        });
        return ret;
    }
  
});


var port = process.env.PORT || 8080; // set our port

http.listen(port, function() {
    console.log('chat server listening on ',fine('*:8080'));
});

exports = module.exports = app; // expose app
