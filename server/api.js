module.exports = function(app, mongoose) {

    var User = require('./models/user')(mongoose);
    var async = require('async');
    var _ = require('lodash');
    
    require('./api/api-user')(app,User);


};
