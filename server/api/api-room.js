/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function(app, Room, User, async, io, roomHelper, roomsOwners, csl) {
    /* 
    app.get('/api/user/friends/:userId', function(req, res) {    
       if(req.query.q =="undefined")
          req.query.q = '';
       User.findOne({_id: req.params.userId})
           .populate('friends')
           .exec(function(err, user) {
            if (err) return console.error(err);

             var regex = new RegExp(req.query.q, "i");
                User.find({username:regex})
                    .exec(function(err,users) {
                      var filtredUsers = [];   
                       user.friends.forEach(function(friend) {
                           users.forEach(function(similar) {
                            if(similar.username==friend.username) {
                                filtredUsers.push(similar);
                              }
                           });

                       });

                        res.send(filtredUsers);
                    });
            });
       });



    app.post('/api/user/get', function(req, res) {    
        console.log(req.body.username,req.body.password);
       User.findOne({
            username: req.body.username,
            password: req.body.password
        }, function(err, user) {
            if (err) return console.error(err);
        
            res.send(user);
        });
    });

*/

    /*
      var roomSchema = new Schema({
            roomName: String,
            users: [Schema.Types.ObjectId],
            created: Date,
            updated: Date
        });

    */

//return the rooms where the username is subcribed in
  app.get('/api/room/:username', function(req, res) {
         Room.find({users: req.params.username}, function(err, rooms) {
              if (err) return console.error(err);

                 res.send(rooms);
              });
             
      });

    //this is a master room creation
    app.post('/api/room/create', function(req, res) {
/*
        var populateUser = function(itemId, callback) {
            User.findOne({
                _id: itemId
            }, function(err, user) {
                if (err) return console.error(err);

                callback(null, user);
            });
        };
*/

        var roomName = "";

       // async.map(req.body.users, populateUser, function(err, populatedUsers) {
        var users = req.body.users.sort();

            users.forEach(function(usr) {
              if(roomName=="")
                roomName = "["+usr;
              else
                roomName = roomName +","+ usr;
            });

            roomName = roomName+"]";

      Room.find({roomName:roomName},function(err,rooms) {
          if (err) return console.error(err);
            
               var room = new Room({
                    roomName: roomName,
                    users: users
                });


                if(rooms.length==0)
                room.save(function(err, savedRoom) {
                    if (err) return console.error(err);

                
                io.sockets.sockets.forEach(function(socket) {
                  if(savedRoom.users.indexOf(socket.nickname)>-1) {
                      
                        //check for new room - if the room is new, set his owner to the current connected socket's nickname
                        if (!roomsOwners[savedRoom.roomName] && typeof roomsOwners[savedRoom.roomName] === "undefined") {
                            roomsOwners[savedRoom.roomName] = {
                                ownerName: socket.nickname,
                                isDefault: false
                            };
                        }

                        socket.join(savedRoom.roomName);
                        socket.myJoinedRoom.push(savedRoom.roomName);
                        
                        console.log('User ', csl.fine(socket.nickname), 'have joined', csl.fine(savedRoom.roomName));

                        //clean out unused rooms - checks if there any unused room and clean them
                        roomHelper.roomsDigest();
                        // roomList();

                  }

                });



                  res.send(savedRoom);

                });
              else
                res.send([]);
                
            });//end check
       // });

        
    });

    /*

        app.put('/api/user/invite/:requestedId', function(req, res) {
            if(req.params.requestedId!=req.body.reqesterId)
            User.findOne({
                _id: req.params.requestedId
            }, function(err, user) {
                if (err) return console.error(err);

                if(user.invitations.indexOf(req.body.reqesterId) == -1 && user.friends.indexOf(req.body.reqesterId)== -1) {
                    user.invitations.push(req.body.reqesterId);
                }

                user.save(function(err, user) {
                    if (err) return console.error(err);

                    res.send(user);
                });
            });
        }); 


        app.put('/api/user/accept/:requestedId', function(req, res) {
            User.findOne({
                _id: req.params.requestedId
            }, function(err, user) {
                if (err) return console.error(err);


                User.findOne({_id: req.body.reqesterId}, function(err,userOther){
                  if (err) return console.error(err);

                    var indexToCut = user.invitations.indexOf(req.body.reqesterId);
                    if (indexToCut > -1) {
                      user.invitations.splice(indexToCut, 1);
                      user.friends.push(req.body.reqesterId);
                      userOther.friends.push(req.params.requestedId);
                    }

                    userOther.save(function(err, user) {
                        if (err) return console.error(err);
                        // console.log(JSON.stringify(user));
                     console.log('userOther saved');

                    });

                    user.save(function(err, user) {
                                    if (err) return console.error(err);
                                    // console.log(JSON.stringify(user));
                                    res.send(user);

                                });

                });

            });
        });

        app.put('/api/user/unfriend/:requestedId', function(req, res) {
            User.findOne({
                _id: req.params.requestedId
            }, function(err, user) {
                if (err) return console.error(err);

                User.findOne({_id: req.body.reqesterId}, function(err,userOther){
                  if (err) return console.error(err);
                    //get the index of the other friend to be deleted
                    var indexToCut = user.friends.indexOf(req.body.reqesterId);

                    if (indexToCut > -1) {
                      user.friends.splice(indexToCut, 1);
                      //get the index of the other friend to be deleted
                      indexToCut = userOther.friends.indexOf(req.params.requestedId);
                      userOther.friends.splice(indexToCut, 1);
                    }

                    userOther.save(function(err, user) {
                        if (err) return console.error(err);
                        // console.log(JSON.stringify(user));
                        console.log('userOther saved');
                    });

                    user.save(function(err, user) {
                        if (err) return console.error(err);
                        // console.log(JSON.stringify(user));
                        res.send(user);
                    });

                });

            });
        });




        //get all users
        app.get('/api/users/get', function(req, res) {
            if(req.query.q =="undefined")
                req.query.q = '';

                var regex = new RegExp(req.query.q, "i");
                User.find({username:regex})
                    .exec(function(err,users) {
                      if (err) return console.error(err);

                

                        res.send(users);
                    });



           // res.send(users);
        });
        */

}
