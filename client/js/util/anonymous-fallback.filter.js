(function() {
  'use strict';

  function anonymousIconFallback() {
    return function (url) {
      return url || 'img/anonymous-icon.png'
    };
  }

  function anonymousUsernameFallback() {
    return function (username) {
      return username || 'Anonymous'
    };
  }

  angular.module('forterChatApp')
    .filter('anonymousIconFallback', anonymousIconFallback)
    .filter('anonymousUsernameFallback', anonymousUsernameFallback);
})();
