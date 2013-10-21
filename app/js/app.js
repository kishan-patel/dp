'use strict';

/* App Module */

var mabvApp = angular.module('mabvApp', [
  'ngRoute',
  'lineController'
]);

mabvApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/file-data/bar', {
        templateUrl: 'partials/file-data-bar.html',
        //controller: 'FdBarCtrl'
      }).
      when('/file-data/line', {
        templateUrl: 'partials/file-data-line.html',
        //controller: 'FdLineCtrl'
      }).
      otherwise({
        redirectTo: '/file-data/line'
      });
}]);
