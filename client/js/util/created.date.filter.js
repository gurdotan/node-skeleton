(function() {
  'use strict';

  function createdDate($filter) {
    return function (user) {
      var str = user._id.substr(0,8);
      var date = new Date(parseInt(str, 16) *1000);

      return $filter("date")(date,'MMM d, HH:mm')
    };
  }

  angular.module('forterChatApp').filter('createdDate', createdDate);
})();