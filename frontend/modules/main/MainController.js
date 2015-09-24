var mainModule = angular.module('module.main', []);


mainModule.controller('MainController', function($scope, $state) {

    $scope.goToLogin = function() {
        $state.go('login');
    }

});
