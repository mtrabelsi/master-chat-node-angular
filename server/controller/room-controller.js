module.exports = function(Room, io, csl) {

    return {

        subscribedRooms: function(req, res) {
            Room.find({ users: req.params.username }, function(err, rooms) {
                if (err) return console.error(err);

                res.send(rooms);
            });

        },

        preCreateRoom: function(req, res, next) {

            var roomName = "";

            // async.map(req.body.users, populateUser, function(err, populatedUsers) {
            var users = req.body.users.sort();

            users.forEach(function(usr) {
                if (roomName == "")
                    roomName = "[" + usr;
                else
                    roomName = roomName + "," + usr;
            });

            roomName = roomName + "]";

            Room.find({ roomName: roomName }, function(err, rooms) {
                if (err) return console.error(err);

                var room = new Room({
                    roomName: roomName,
                    owner: req.body.owner,
                    default: true,
                    users: users
                });

                if (rooms.length > 0) {
                    room = rooms[0];
                    req.body.users.forEach(function(usr) {
                        if (room.users.indexOf(usr) == -1)
                            room.users.push(usr);
                    });

                }
                req._room = room;
                next();


            }); //end check

        },

        createRoom: function(req, res) {
            var room = req._room;
            room.save(function(err, savedRoom) {
                if (err) return console.error(err);

                io.sockets.sockets.forEach(function(socket) {
                    if (savedRoom.users.indexOf(socket.nickname) > -1) {

                        socket.join(savedRoom.roomName);
                        socket.myJoinedRoom.push(savedRoom.roomName);

                        console.log('User ', csl.fine(socket.nickname), 'have joined', csl.fine(savedRoom.roomName));

                        Room.find({ users: socket.nickname }, function(err, rms) {
                            if (err) return console.error(err);

                            io.to(socket.id).emit('roomList', {
                                rooms: rms
                            });

                        });

                    }

                });
                res.send(savedRoom);
            });

        }
    }
};
