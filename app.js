'use strict';

// define globals
var express      = require('express'),
    http         = require('http'),
    app          = express(),
    server       = http.createServer(app),
    io           = require('socket.io').listen(server),
    port         = 3000;

app.use(express.static(__dirname + '/client'));

// set up websockets
require('./server/sockets')(io);

// start the server
server.listen(port);
console.log(`Web server listening on port ${port}`);
