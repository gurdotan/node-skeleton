(function() {
  'use strict';

  function createdDate($filter) {
    return function (timestamp) {
      return $filter("date")(new Date(timestamp),'MMM d, HH:mm')
    };
  }

  angular.module('forterChatApp').filter('createdDate', createdDate);
})();