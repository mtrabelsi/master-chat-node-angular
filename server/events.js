module.exports = function(io, roomsOwners, userHelper, roomHelper, csl, Message, Room) {
var invitedUsers = [];
var acceptedInviteUsers = [];

    io.on('connection', function(socket) {

/********* @pmsg *********
Description : This event handle sending users private messages - the server will look for that user using his nickname
Params      : msg object {message: STRING, nickname: STRING} - where the nickname is the user nickname
receiving the message
**********           **********/

        socket.on('pmsg', function(msg) {
            if (!socket.room || typeof socket.room == "undefined") {
                io.sockets.to(socket.id).emit('msgFront', {
                    nickname: 'ROBOT',
                    message: 'You cant send private message, please join at least a room first!'
                });
                return;
            }
            if (userHelper.isAlreadyJoined(msg.to, socket.room)) {
                var toUser = userHelper.getUserByNickname(msg.to);
                console.log('toUser', toUser);
                console.log('msg', msg);

                [toUser.id, socket.id].forEach(function(id) {
                    io.sockets.to(id).emit('pmsgFront', {
                        private: true,
                        nickname: socket.nickname,
                        message: msg.message
                    });
                });
            } else {
                io.sockets.to(socket.id).emit('msgFront', {
                    nickname: 'ROBOT',
                    message: 'You cant send private message to users of other room!'
                });
            }
        });


/********* @getRoomList *********
Description : This event sends all rooms informations when a user connects,joins,leaves or disconnects.
Params      : NO PARAMS
**********           **********/

        socket.on('getRoomList', roomList);


/********* @getUserList *********
Description : This event sends all users informations when a user fire it.
Params      : NO PARAMS
**********           **********/

        socket.on('getUserList', userList);


/********* @invite *********
Description : This event handle sending/prodcasting users messages inside a specific room
Params      : msg object {message: STRING, nickname: STRING} - where the nickname is the
sender of the message
**********           **********/

        socket.on('invite', function(users) {
            if (socket.room && typeof socket.room != "undefined") {

                users.forEach(function(user) {
                    io.sockets.to(user.id).emit('inviteFront', {
                        from: socket.nickname,
                        room: socket.room
                    });
                });

            } else {
                io.sockets.to(socket.id).emit('msgFront', {
                    nickname: 'ROBOT',
                    message: 'You cant invite users, please join at least a room then try again!'
                });
            }
        });


/********* @msg *********
Description : This event handle sending/prodcasting users messages inside a specific room
Params      : msg object {message: STRING, nickname: STRING} - where the nickname is the
sender of the message
**********           **********/
        socket.on('msg', function(msg) {
            if (typeof socket.myJoinedRoom != "undefined" && socket.myJoinedRoom.indexOf(msg.toRoom)!=-1) {
        //Socket.emit("msg", {nickname: $rootScope.user.username, message:msg, toRoom: $rootScope.activeRoom});

                var message = new Message({
                    toRoom: msg.toRoom,
                    nickname: msg.nickname,
                    message: msg.message
                });

                message.save(function(err, savedMessage) {
                    if (err) return console.error(err);
                    
                    io.sockets.to(msg.toRoom).emit('msgFront', msg);

                });

            } else {
                io.sockets.to(socket.id).emit('msgFront', {
                    nickname: 'ROBOT',
                    message: 'You cant send message to rooms your not connected in, please join this room then try again!'
                });
            }
        });


    socket.on('acceptInvite', function(accept) {
           
            Room.findOne({roomName:accept.roomName},function(err,room) {
                 if (err) return console.error(err);

                room.users.push(accept.nickname);

                room.save(function(err, savedRoom) {
                    if (err) return console.error(err);

                            socket.join(savedRoom.roomName);
                            socket.myJoinedRoom.push(savedRoom.roomName);

                            Room.find({users: socket.nickname}, function(err, rms) {
                             if (err) return console.error(err);

                             io.to(socket.id).emit('roomList', {
                                                         rooms: rms
                                                        });

                            });

                });
            });

        });

    socket.on('leave', function(leave) {
           
            Room.findOne({roomName:leave.roomName},function(err,room) {
                 if (err) return console.error(err);

                room.users.splice(room.users.indexOf(leave.who),1);

                room.save(function(err, savedRoom) {
                    if (err) return console.error(err);

                            socket.leave(savedRoom.roomName);
                            socket.myJoinedRoom.splice(socket.myJoinedRoom.indexOf(savedRoom.roomName),1);

                io.sockets.sockets.forEach(function(sock) {
                  if(savedRoom.users.indexOf(sock.nickname)>-1 || sock.nickname==socket.nickname) {
                            Room.find({users: sock.nickname}, function(err, rms) {
                             if (err) return console.error(err);

                             io.to(sock.id).emit('roomList', {
                                                         rooms: rms
                                                        });

                            });
                        }
                    });

                });
            });

        });

    socket.on('kick', function(leave) {
           
            Room.findOne({roomName:leave.roomName},function(err,room) {
                 if (err) return console.error(err);
                 
                 //prevent hacking
                 if(room.owner!=socket.nickname)
                    return;

                room.users.splice(room.users.indexOf(leave.kicked),1);

                room.save(function(err, savedRoom) {
                    if (err) return console.error(err);

             
                io.sockets.sockets.forEach(function(sock) {
                  
                    if(sock.nickname==leave.kicked) {
                       sock.leave(savedRoom.roomName);
                       sock.myJoinedRoom.splice(sock.myJoinedRoom.indexOf(savedRoom.roomName),1);
                    }
                    
                            Room.find({users: sock.nickname}, function(err, rms) {
                             if (err) return console.error(err);

                             io.to(sock.id).emit('roomList', {
                                                         rooms: rms
                                                        });


                            });
                        
                    });

                });
            });

        });

/********* @roomEvent *********
Description : This event handle room join and leave and all related info
Params      : room object {join: BOOLEAN, roomName: STRING}
**********           **********/
socket.on('roomEvent', function(roomP) {
  
if(roomP.invite==true) {

 Room.find({roomName:roomP.roomName},function(err,rooms) {
          if (err) return console.error(err);

            
               var room = new Room({
                    roomName: roomP.roomName,
                    owner: roomP.owner,
                    users: [socket.nickname],
                    custom: true
                });


                if(rooms.length!=0) {
                    room = rooms[0];
                    room.users.forEach(function(usr) {

                        if(roomP.users.indexOf(usr)!=-1) {
                            roomP.users.splice(roomP.users.indexOf(usr),1);
                        }
                    })

                }

                room.save(function(err, savedRoom) {
                    if (err) return console.error(err);

                         socket.join(savedRoom.roomName);
                         socket.myJoinedRoom.push(savedRoom.roomName);
                         
                         Room.find({users: socket.nickname}, function(err, rms) {
                             if (err) return console.error(err);

                             io.to(socket.id).emit('roomList', {
                                                         rooms: rms
                                                        });

                            });

                    //after creating the room with just one user
                    io.sockets.sockets.forEach(function(sock) {


                        if((roomP.users.indexOf(sock.nickname)>-1)&&socket.nickname!=sock.nickname) {
                               io.sockets.to(sock.id).emit('inviteFront', {
                                            from: socket.nickname,
                                            room: roomP.roomName
                                        });

                              console.log("invited", sock.nickname);
                             }

                        });



                });
        });

return;
}

        Room.find({roomName:roomP.roomName},function(err,rooms) {
          if (err) return console.error(err);

            
               var room = new Room({
                    roomName: roomP.roomName,
                    owner: roomP.owner,
                    users: roomP.users
                });


            if(rooms.length!=0) {
                room = rooms[0];
                roomP.users.forEach(function(usr){
                    if(room.users.indexOf(usr)==-1)
                        room.users.push(usr);
                });
            }

                room.save(function(err, savedRoom) {
                    if (err) return console.error(err);

                    io.sockets.sockets.forEach(function(sock) {
                      if(savedRoom.users.indexOf(sock.nickname)>-1) {
                                                  
                            //check for new room - if the room is new, set his owner to the current connected socket's nickname
                            if (!roomsOwners[savedRoom.roomName] && typeof roomsOwners[savedRoom.roomName] === "undefined") {
                                roomsOwners[savedRoom.roomName] = {
                                    ownerName: sock.nickname,
                                    isDefault: false
                                };
                            }

                            sock.join(savedRoom.roomName);
                            sock.myJoinedRoom.push(savedRoom.roomName);

                            Room.find({users: sock.nickname}, function(err, rms) {
                             if (err) return console.error(err);

                             io.to(sock.id).emit('roomList', {
                                                         rooms: rms
                                                        });

                            });
                            
                            console.log('User ', csl.fine(sock.nickname), 'have joined', csl.fine(savedRoom.roomName));
                            //clean out unused rooms - checks if there any unused room and clean them
                            roomHelper.roomsDigest();
                           // roomList();
                      }
                    });

                // res.send(savedRoom);
                });
         
                //res.send([]);
                
            });//end check 

    });

/********* @disconnect *********
Description : This event handle user disconnection and related infos
Params      : NO PARAMS
**********           **********/
        socket.on('disconnect', function() {
            console.log(csl.error('User <' + socket.nickname + '> disconnected'));
            //clean out unused rooms - checks if there any unused room and clean them
            roomHelper.roomsDigest();
           // roomList();
        });


        function roomList(targetRoom) {
            var rooms = roomHelper.getRoomsList();
            io.to(targetRoom).emit('roomList', {
                rooms: rooms
            });
        }

        function userList() {
            var users = userHelper.getUsersList();

            io.emit('userList', {
                users: users
            });
        }


    });

}
