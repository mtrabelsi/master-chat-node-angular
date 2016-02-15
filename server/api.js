module.exports = function(async, roomController,Message, User,  Room, app, mongoose, io, roomHelper, roomsOwners, csl) {

    //var _ = require('lodash');
    
    require('./api/api-user')(app, User);
    require('./api/api-room')(async, roomController, app, Room, User, async, io, roomHelper, roomsOwners, csl);

    app.get('/api/messages/:roomName', function(req,res) {
    	Message.find({toRoom:req.params.roomName}, function(err,messages){
    		if(err) console.log(err);

    		res.send(messages)
    	});
    });

};
