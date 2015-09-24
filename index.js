// modules =================================================
var express = require('express');
var app = express();


var http = require('http').Server(app);
var io = require('socket.io')(http);


var mongoose = require('mongoose');
var methodOverride = require('method-override');

var passport = require('passport');
var flash = require('connect-flash');

// var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

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
// app.use(express.static(__dirname + '/')); // set the static files location /public/img will be /img for users

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.get('/', function(req, res) {
    res.sendfile(prefixFrontend + 'modules/main/views/index.html');
    // res.sendfile('/home/smartytwiti/Documents/chatServer/frontend/modules/main/views/index.html');
});


//middelware
io.use(function(socket, next) {
    socket.nickname = socket.request._query['nickname'];
    next();
});

var mainRoom = 'Main room';
io.on('connection', function(socket) {

    //automatically join to the main room
    // socket.join(socket.room);
    //leave his own room (default since >= 1.x)
   // socket.leave(socket.id);

    socket.on('getRoomList', roomList);

    socket.on('msg', function(msg) {
        io.sockets.to(mainRoom).emit('msgFront', msg);
    });

    socket.on('roomEvent', function(room) {
        if (room.join == true){//leave the previous room and join the new one
            socket.leave(socket.room);
            socket.join(room.roomName);
            socket.room = room.roomName;
        }
        else{//just leave a specific room
            socket.leave(room.roomName);
            delete socket.room;
        }

        roomList();
    });

    socket.on('disconnect', function() {
        console.log('user',socket.nickname,'disconnected');
        roomList();
    });


    function roomList() {
        var users = [];
        io.sockets.sockets.forEach(function(socket) {
            console.log(socket.id,socket.nickname);
            users.push({
                id: socket.id,
                nickname: socket.nickname
            })
        });

    

        io.emit('roomList', {
            rooms: io.sockets.adapter.rooms,
            users: users
        });
    }
    /*
    function addOwner(rooms) {
        // io.sockets.adapter.rooms[socket.id].owner = socket.username;


         Object.keys(rooms).forEach(function(key, indx){
                var username = getUsernameById(key);
                console.log('username '+ username);
               rooms[key].owner = username;

             });

    return rooms;
    }

    function getUsernameById(id) {
      var util = require('util');
     // console.log(JSON.stringify(io.sockets.sockets));
         io.sockets.sockets.map(function(e) {
            if(e.id==id)
            {
              
            //  console.log(util.inspect(e, { showHidden: true, depth: null }));

          console.log('username found '+ e.username);

              return e.username;
            }
        })
      }
    */
});


var port = process.env.PORT || 8080; // set our port

http.listen(port, function() {
    console.log('chat server listening on *:8080');
});

exports = module.exports = app; // expose app
