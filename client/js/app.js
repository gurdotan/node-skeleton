// App
var app = angular.module('app', [
  'btford.socket-io'
]);

// Service to fetch some data..
app.factory('dataServ', ['$http', function($http) {
  return {
    get: function() {
      return $http.get('/data');
    }
  }
}]);

app.factory('chatSocket', function (socketFactory) {
  var socket = socketFactory();
  socket.forward('broadcast');
  return socket;
});

app.value('messageFormatter', function(date, nick, message) {
  return date.toLocaleTimeString() + ' - ' +
    nick + ' - ' +
    message + '\n';

});


// App controller
app.controller('appController', ['$scope', 'dataServ', 'chatSocket', '$log', 'messageFormatter', function($scope, Data, chatSocket, $log, messageFormatter) {

  $scope.funnyStuff = {question: '', answer: ''};

  Data.get()
    .success(function(resp) {
      $scope.funnyStuff = resp;
    });


  var number = Math.random();
  var nickName = 'Gur' + number;
  $scope.message = 'Hi there ' + number;
  $scope.nickName = nickName;
  $scope.messageLog = 'Ready to chat!';
  $scope.sendMessage = function() {
    var match = $scope.message.match('^\/nick (.*)');

    if (angular.isDefined(match) && angular.isArray(match) && match.length === 2) {
      var oldNick = nickName;
      nickName = match[1];
      $scope.message = '';
      $scope.messageLog = messageFormatter(new Date(),
          nickName, 'nickname changed - from ' +
          oldNick + ' to ' + nickName + '!') + $scope.messageLog;
      $scope.nickName = nickName;
    }

    $log.debug('sending message', $scope.message);
    chatSocket.emit('message', nickName, $scope.message);
    // $scope.message = '';
  };

  $scope.$on('socket:broadcast', function(event, data) {
    $log.debug('got a message', event.name);
    if (!data.payload) {
      $log.error('invalid message', 'event', event, 'data', JSON.stringify(data));
      return;
    }
    $log.debug(data);
    $scope.$apply(function() {
      $scope.messageLog = $scope.messageLog + messageFormatter(new Date(), data.source, data.payload);
    });
  });

}]);