'use strict';

var _ = require('lodash'),
    qa = require('./qa');

var qaBank = {}, userQaCount = {}, users = [];


var processQuestion = (question, username) => {
  var q = question.toLowerCase();
  if (qaBank[q]) return qaBank[q];

  if (userQaCount[q]) {
    if (userQaCount[q][username]) {
      return 'You already asked that!';
    }
  } else {
    (userQaCount[q]) || (userQaCount[q] = {});
    (userQaCount[q][username]) || (userQaCount[q][username] = 0);
    userQaCount[q][username]++;
  }
  // return 'Beats me!';
};

var isQuestion = (message) => {
  return _.endsWith(message, '?');
};

var lookupTeaser = (message) => {
  if (message.match(/chuck\s+?norr?is/i)) {
    return qa.chuckNorris[_.random(qa.chuckNorris.length)];
  }
};

var isAnswer = (message) => {
  return _.startsWith(message.toLowerCase(), 'a:');
};

var saveAnswer = (question, answer) => {
  var key = question.toLowerCase().replace(/^[aA]:\s*/, '');
  qaBank[key] = answer;
};


module.exports = (io) => {

  var lastMessage;

  var broadcastChatbotMessage = (message) => {
    io.sockets.emit('broadcast', {
      username: 'Chatbot',
      avatarUrl: 'http://www.colinkeany.com/lovebot/assets/images/icon.png',
      text: message,
      timestamp: Date.now()
    });
  };


  io.on('connection', (socket) => {

    // Save current user in closure.
    // We'll need it in order to remove the current user
    // when his/her socket will get disconnected.
    var _user = {};

    socket.on('message', (message) => {

      console.log('received message: ', JSON.stringify(message));

      var now = Date.now();
      io.sockets.emit('broadcast', _.extend({timestamp: now}, message));

      var currentMessage = message.text,
        answer;

      //
      // Check if the current message is a question
      // and give Chatbot an opportunity to answer
      //
      if (isQuestion(currentMessage) &&
        (answer = processQuestion(currentMessage, message.username))) {

        // Send answer to all chat room users
        broadcastChatbotMessage(answer);

      } else if (isQuestion(lastMessage) && isAnswer(currentMessage)) {

        // Cache Q&A pairs for Chatbot to use later
        saveAnswer(lastMessage, currentMessage);

      } else if (answer = lookupTeaser(currentMessage)) {

        //
        // Let Chatbot intercept messages with teasers and pull pranks
        // Supported teasers: 'Chuck Norris'
        //
        broadcastChatbotMessage(answer);
      }

      // Keep track of last message
      lastMessage = currentMessage;

      console.log('broadcast complete');
    });
    
    socket.on('subscribe', (user) => {
      console.log(`Subscribed: ${user.username}`);
      _user = user;
      users.push(user);
      io.sockets.emit('users.update', users);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${_user.username}`);
      _.remove(users, _user);
      _user = null;
      io.sockets.emit('users.update', users);
    });

  });
};
