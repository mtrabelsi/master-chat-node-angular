module.exports = function(app, mongoose, io, roomHelper, roomsOwners, csl) {

    var User = require('./models/user')(mongoose);
    var Room = require('./models/room')(mongoose);

    var async = require('async');
    //var _ = require('lodash');
    
    require('./api/api-user')(app, User);
    require('./api/api-room')(app, Room, User, async, io, roomHelper, roomsOwners, csl);

};
