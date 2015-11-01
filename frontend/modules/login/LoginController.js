var loginModule = angular.module('module.login', []);

loginModule.controller('LoginController', function($scope,$rootScope,$state,$http) {


	$scope.signupData = {
		username: '',
		password: ''
	};

    $scope.signin = function() {
      $rootScope.nickname=$scope.nickname;
      $state.go('chat');
    };


  	$scope.signup = function() {
	  	$http.post('/api/user',{
	  		username : $scope.signupData.username,
	  		password: $scope.signupData.password
	  	}).success(function(data){
	  		$scope.nickname = data.username;
	  	});
  	};

});
