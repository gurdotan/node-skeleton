var _ = require('lodash');

var qaBank = {};

var processQuestion = function(question, username) {
  var question = question.toLowerCase();
  if (qaBank[question]) {
    return 'You already asked that!'
  } else {
    (qaBank[question]) || (qaBank[question] = {});
    (qaBank[question][username]) || (qaBank[question][username] = 0);
    qaBank[question][username]++;
  }
  return 'Beats me!';
};



module.exports = function (io) {
  'use strict';
  io.on('connection', function (socket) {
    socket.on('message', function (message) {

      console.log('recieved message: ', JSON.stringify(message));
      console.log('broadcasting message');
      console.log('message is', message);

      var now = Date.now();
      var broadcastMessage = _.extend({timestamp: now}, message);

      io.sockets.emit('broadcast', broadcastMessage);

      if (message.text.match(/\?$/)) {

        // TODO: Let chatbot respond
        io.sockets.emit('broadcast', {
          username: 'Chatbot',
          avatarUrl: 'http://www.colinkeany.com/lovebot/assets/images/icon.png',
          text: processQuestion(message.text, message.username),
          timestamp: now
        });

      }

      console.log('broadcast complete');
    });
  });
};
