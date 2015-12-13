/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function(app, User) {
   
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
           


    app.get('/api/user/invitations/:userId', function(req, res) {    
       User.findOne({_id: req.params.userId})
           .populate('invitations')
           .exec(function(err, user) {
            if (err) return console.error(err);
               res.send(user.invitations);
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


    app.post('/api/user/create', function(req, res) {
        var user = new User({
            username: req.body.username,
            password: req.body.password
        });

        user.save(function(err, user) {
            if (err) return console.error(err);

            console.log(JSON.stringify(user));
            res.send(user);

        });
    });


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

}