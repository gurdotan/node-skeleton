'use strict';

var _ = require('lodash'),
    stringSimilarity = require('string-similarity'),
    qa = require('./qa');

var pastQuestions = {}, userQaCount = {}, users = [];


var answerToSimilarQuestion = (question, collection) => {
  return _.find(collection, (a, q) => {
    return stringSimilarity.compareTwoStrings(question, q) > 0.7;
  });
};

var processQuestion = (question) => {
  var q = question.toLowerCase();
  return answerToSimilarQuestion(q, pastQuestions) || answerToSimilarQuestion(q, qa.common);
};

var isUserSpammer = (question, username) => {
  var users;
  if (users = answerToSimilarQuestion(question, userQaCount)) {
    if (users[username]) {
      return _.sample(qa.spammerResponses);
    }
  }

  // Save the question for next round's lookup
  (userQaCount[question]) || (userQaCount[question] = {});
  (userQaCount[question][username]) || (userQaCount[question][username] = true);
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
  pastQuestions[key] = answer;
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
        answer, warning;

      if (warning = isUserSpammer(currentMessage, message.username)) {
        broadcastChatbotMessage(warning);
      }

      //
      // Check if the current message is a question
      // and give Chatbot an opportunity to answer
      //
      if (isQuestion(currentMessage) &&
        (answer = processQuestion(currentMessage))) {

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
