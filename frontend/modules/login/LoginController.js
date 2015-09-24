var loginModule = angular.module('module.login', []);

loginModule.controller('LoginController', function($scope,$rootScope,$state) {

    $scope.signin = function() {
      $rootScope.nickname=$scope.nickname;
      $state.go('chat');
    };

});
