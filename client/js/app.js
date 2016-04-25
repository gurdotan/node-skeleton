//
// Forter Chat App
// Inspired by https://github.com/annatomka/angular-chat
//

var app = angular.module('forterChatApp', [
  'btford.socket-io',
  'ngMaterial',
  'LocalStorageModule'
]).config(['$mdThemingProvider', 'localStorageServiceProvider', function($mdThemingProvider, localStorageServiceProvider) {

    // Set Angular Material theme
    $mdThemingProvider.theme('default');

    // Configure local storage
    localStorageServiceProvider.setPrefix('forterChatApp');
  }])
  .constant('_', window._)
  .factory('chatSocket', function(socketFactory) {
    var socket = socketFactory();
    socket.forward('broadcast');
    return socket;
  });


// App controller
app.controller('AppController', ['$scope', 'chatSocket', '$log', 'localStorageService', function($scope, chatSocket, $log, localStorageService) {

  var vm = this;

  //
  // scope variables
  //
  vm.messages = [];
  vm.users = [];
  vm.username = localStorageService.get('username') || '';
  vm.avatarUrl = localStorageService.get('avatarUrl') || '';
  vm.newMessage = '';

  vm.createMessage = function() {
    chatSocket.emit('message', {
      username : vm.username,
      avatarUrl: vm.avatarUrl,
      text     : vm.newMessage.trim()
    });
    vm.newMessage = '';
  };

  vm.persistUsername = function() {
    localStorageService.set('username', vm.username);
  };
  vm.persistAvatarUrl = function() {
    localStorageService.set('avatarUrl', vm.avatarUrl);
  };

  $scope.$on('socket:broadcast', function(event, message) {
    $log.debug('got message:', message);
    if (!message.text) {
      $log.error('invalid message', 'event', event, 'data', JSON.stringify(message));
      return;
    }

    if (!message.avatarUrl) message.avatarUrl = 'img/anonymous-icon.png';
    vm.messages.push(message);
  });


  chatSocket.emit("subscribe", {username: vm.username, avatarUrl: vm.avatarUrl});

  chatSocket.on("users.update", function(users) {
    vm.users = users;
  });
  
}]);