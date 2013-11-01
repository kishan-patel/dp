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
      when('/file-data/bar', {
        templateUrl: 'partials/file-data-bar.html',
        //controller: 'FdBarCtrl'
      }).
      when('/file-data/line', {
        templateUrl: 'partials/file-data-line.html',
        //controller: 'FdLineCtrl'
      }).
      when('/file-data/scatter', {
        templateUrl: 'partials/file-data-scatter.html',
      }).
      otherwise({
        redirectTo: '/file-data/bar'
      });
}]);
