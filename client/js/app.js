// App

//
// Inspired by https://github.com/annatomka/angular-chat
//

var app = angular.module('forterChatApp', [
  'btford.socket-io',
  'ngMaterial',
  'LocalStorageModule'
]).config(['$mdThemingProvider', 'localStorageServiceProvider', function($mdThemingProvider, localStorageServiceProvider) {
  $mdThemingProvider.theme('default');
    // .primaryPalette('pink')
    // .accentPalette('orange');

  localStorageServiceProvider
    .setPrefix('forterChatApp');

}]);

app.constant('_', window._);


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
app.controller('AppController', ['$scope', 'dataServ', 'chatSocket', '$log', 'messageFormatter', 'localStorageService', function($scope, Data, chatSocket, $log, messageFormatter, localStorageService) {

  $scope.funnyStuff = {question: '', answer: ''};

  var vm = this;

  vm.username = localStorageService.get('username') || '';
  vm.avatarUrl = localStorageService.get('avatarUrl') || '';
  vm.newMessage = '';
  vm.createMessage = function() {
    chatSocket.emit('message', {
      username: vm.username,
      avatarUrl: vm.avatarUrl,
      text: vm.newMessage.trim()
    });
    vm.newMessage = '';
  };

  vm.messages = [];
  vm.users = [];
  // vm.allusers = allUsersFactory.users;

  
  vm.persistUsername = function() {
    localStorageService.set('username', vm.username);
  };
  vm.persistAvatarUrl = function() {
    localStorageService.set('avatarUrl', vm.avatarUrl);
  };


  // Data.get()
  //   .success(function(resp) {
  //     $scope.funnyStuff = resp;
  //   });


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
    chatSocket.emit('message', {
      username: vm.username,
      avatarUrl: vm.avatarUrl,
      text: vm.newMessage
    });
  };

  $scope.$on('socket:broadcast', function(event, message) {
    $log.debug('got a message', event.name);
    if (!message.text) {
      $log.error('invalid message', 'event', event, 'data', JSON.stringify(message));
      return;
    }
    $log.debug(message);
    $scope.$apply(function() {
      $scope.messageLog = $scope.messageLog + messageFormatter(new Date(), message.source, message.payload);
    });

    if (!message.avatarUrl) message.avatarUrl = 'img/anonymous-icon.png';
    vm.messages.push(message);

  });

  vm.users = [];

  chatSocket.emit("subscribe", {username: vm.username, avatarUrl: vm.avatarUrl});

  chatSocket.on("users.update",function (users) {
    vm.users = users;
  });

  chatSocket.on("user.left",function (user) {
    _.remove(vm.users, {
      username: user.username
    });
  });



}]);