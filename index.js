var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('mongoose');
var methodOverride = require('method-override');

var passport = require('passport');
var flash = require('connect-flash');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var chalk = require('chalk');

var error = chalk.bold.red;
var warn = chalk.bold.yellow;
var fine = chalk.bold.green;
var info = chalk.bold.blue;

var csl = {
    error: error,
    warn: warn,
    fine: fine,
    info: info
};

//prefixes
var prefixFrontend = __dirname + '/frontend/';
var prefixBower = __dirname + '/bower_modules';

//handle rooms owners list
var roomsOwners = new Object();
var userHelper = require('./server/userHelper.js')(io);
var roomHelper = require('./server/roomHelper.js')(io, roomsOwners, userHelper, csl);

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

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//boot level of the frontend side
app.get('/', function(req, res) {
    res.sendfile(prefixFrontend + 'modules/main/views/index.html');
});

//middelware that will be executed for each new connected user
io.use(function(socket, next) {
    socket.nickname = socket.request._query['nickname'];
    console.log('User with nickname ', info(socket.nickname), ' has set his nickname');
    next();
});

var events = require('./server/events')(io, roomsOwners, userHelper, roomHelper, csl);

var port = process.env.PORT || 8080; // set our port

http.listen(port, function() {
    console.log('chat server listening on ', fine('*:8080'));
});

exports = module.exports = app; // expose app
