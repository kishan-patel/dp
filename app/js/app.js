'use strict';

/* App Module */

var mabvApp = angular.module('mabvApp', [
  'ngRoute',
  'mabvControllers'
]);

mabvApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/file-data/bar', {
        templateUrl: '../partials/file-data-bar.html',
        controller: 'fdBarCtrl'
      }).
      when('/file-data/line', {
          templateUrl: '../partials/file-data-line.html',
          controller: 'fdLinkeCtrl'
      });
  }
]);
