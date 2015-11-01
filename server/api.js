module.exports = function(app, mongoose) {

    var User = require('./models/user')(mongoose);

    app.post('/api/user', function(req, res) {
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

            if(user.invitations.indexOf(req.body.reqesterId) == -1)
                user.invitations.push(req.body.reqesterId);

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

            var indexToCut = user.invitations.indexOf(req.body.reqesterId);
            if (indexToCut > -1) {
              user.invitations.splice(indexToCut, 1);
              user.friends.push(req.body.reqesterId);
            }

            user.save(function(err, user) {
                if (err) return console.error(err);

                // console.log(JSON.stringify(user));
                res.send(user);

            });
        });
    });

    app.get('/api/user', function(req, res) {
        User.find({}, function(err, users) {
            if (err) return console.error(err);
            res.send(users);
        });
    });

}
