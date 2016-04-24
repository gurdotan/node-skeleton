(function() {
  'use strict';

  function message() {

    function MessageController($mdDialog) {
      var messageCtrl = this;
    }

    return {
      restrict        : 'E',
      templateUrl     : 'js/message/message.item.tmpl.html',
      controller      : MessageController,
      controllerAs    : 'messageCtrl',
      bindToController: true,
      scope           : {
        message: "="
      }
    };

  }

  angular.module('forterChatApp').directive('message', message);
})();