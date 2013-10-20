'use strict';

/* App Module */

var mabvApp = angular.module('mabvApp', [
  'ngRoute',
  'mabvControllers'
]);

mabvApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/file-data.html',
        controller: 'fileDataCtrl'
      });
  }
]);
