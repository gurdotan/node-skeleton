'use strict';

// define globals
var express      = require('express'),
    io           = require('socket.io'),
    http         = require('http'),
    app          = express(),
    server       = http.createServer(app),
    io           = io.listen(server),
    path         = require('path'),
    // favicon      = require('static-favicon'),
    // logger       = require('morgan'),
    // cookieParser = require('cookie-parser'),
    // bodyParser   = require('body-parser'),
    port         = 3000;

app.use(express.static(__dirname + '/client')); 		// statics
require('./server/routes.js')(app);						// routes

// set up our socket server
require('./server/sockets')(io);


// optional - set socket.io logging level
io.set('log level', 1000);

/*
 // view engine setup (for later)
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'jade');

 // middleware settings
 app.use(favicon());
 app.use(logger('dev'));
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded());
 app.use(cookieParser());
 app.use(require('stylus').middleware(path.join(__dirname, 'public')));
 */



// start the server
server.listen(port);
console.log("Web server listening on port " + port);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


//module.exports = app;