module.exports = function(app, mongoose) {

    var User = require('./models/user')(mongoose);
    var async = require('async');


    app.get('/api/user/friends/:userId', function(req, res) {    
       User.findOne({_id: req.params.userId})
           .populate('friends')
           .exec(function(err, user) {
            if (err) return console.error(err);
               res.send(user.friends);
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
        User.find({}, function(err, users) {
            if (err) return console.error(err);
            res.send(users);
        });
    });

}
