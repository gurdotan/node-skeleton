var _ = require('lodash');

var processQuestion = function(from, message) {

};



module.exports = function (io) {
  'use strict';
  io.on('connection', function (socket) {
    socket.on('message', function (message) {

      console.log('recieved message: ', JSON.stringify(message));
      console.log('broadcasting message');
      console.log('message is', message);

      var broadcastMessage = _.extend({timestamp: Date.now()}, message);

      io.sockets.emit('broadcast', broadcastMessage);

      if (message.text.match(/\?$/)) {

        // TODO: Let chatbot respond
        // io.sockets.emit('broadcast', _.extend(broadcastMessage, {
        //   text: message.text
        // }));

      }

      console.log('broadcast complete');
    });
  });
};
