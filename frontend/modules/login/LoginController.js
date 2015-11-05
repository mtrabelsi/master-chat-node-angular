var loginModule = angular.module('module.login', []);

loginModule.controller('LoginController', function($scope,$rootScope,$state,$http) {

	$scope.nickname = 'marwen';
	$scope.password = 'trabelsi';

	$scope.signupData = {
		username: '',
		password: ''
	};


    $scope.signin = function() {
	 	$http.post('/api/user/get',{
	  		username : $scope.nickname,
	  		password: $scope.password
	  	}).success(function(data) {
	  		if($scope.nickname == data.username) {
		      $rootScope.user =  data;
		      $state.go('chat');	  			
	  		} else {
	  			alert('Please verify your credential..')
	  		}
	  	});
    };


  	$scope.signup = function() {
	  	$http.post('/api/user/create',{
	  		username : $scope.signupData.username,
	  		password: $scope.signupData.password
	  	}).success(function(data){
	  		$scope.nickname = data.username;
	  	});
  	};

});
