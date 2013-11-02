'use strict';

/* App Module */

var mabvApp = angular.module('mabvApp', [
  'ngRoute',
  'barController',
  'lineController',
]);

mabvApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/file', {
        templateUrl: 'partials/file-upload.html',
      }).
      when('/live', {
        templateUrl: 'partials/live-stream.html',
      }).
      when('/simulator', {
        templateUrl: 'partials/simulator.html',
      }).
      otherwise({
        redirectTo: '/file-data/file-upload.html'
      });
}]);
