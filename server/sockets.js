module.exports = function (io) {
  'use strict';
  io.on('connection', function (socket) {
    socket.on('message', function (from, message) {

      console.log('recieved message from', from, 'msg', JSON.stringify(message));
      console.log('broadcasting message');
      console.log('message is', message);

      io.sockets.emit('broadcast', {
        text: message,
        authorId: from,
        source: from
      });
      console.log('broadcast complete');
    });
  });
};
