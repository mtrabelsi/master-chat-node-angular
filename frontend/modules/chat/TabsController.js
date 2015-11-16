chatModule.controller('TabsController', function($q, $scope, $rootScope, $http) {

    $scope.users = [];
    $scope.search = {
     
            fusername: '',
            ousername: ''
      
    };


    $scope.tabs = [{
        "title": "Rooms",
        "page": "modules/chat/views/tabs/rooms.html"
    }, {
        "title": "Friends",
        "page": "modules/chat/views/tabs/friends.html"
    }, {
        "title": "Search",
        "page": "modules/chat/views/tabs/allUsers.html"
    }, {
        "title": "Invitations",
        "page": "modules/chat/views/tabs/invitations.html"
    }];
    $scope.changeTab = function(tab){
        $scope.tabs.activeTab = tab;
    }

    $scope.unfriend = function(userId) {
        console.log(userId);
          $http.put('/api/user/unfriend/'+$rootScope.user._id,{reqesterId: userId}).success(function(user){
               $http.get('/api/user/friends/'+$rootScope.user._id).success(function(friends){
                    $scope.friends = friends;
                });
            });
    }

    $scope.startConversation = function(userId) {
        alert('startConversation');
    }

    $scope.sendInvitation = function(userId) {
           $http.put('/api/user/invite/'+userId,{reqesterId: $rootScope.user._id}).success(function(user){
                console.log('invited '+userId);
            });
    }
    $scope.accept = function(decision,userId){
          var deferred = $q.defer();

        if(decision==false) {
            alert("It's not a bug, but it's not implimented yet!");
        } else {
            $http.put('/api/user/accept/'+$rootScope.user._id,{reqesterId: userId}).success(function(user){
               $http.get('/api/user/invitations/'+$rootScope.user._id).success(function(invitations){
                    console.log(invitations);
                    $scope.invitations = invitations;
                });
            });
        }
    }

    $scope.tabs.activeTab = "Rooms";

    var handleTabChange = function() {

        if($scope.tabs.activeTab=="Friends") {
            $scope.search('friends');
        }

        if($scope.tabs.activeTab=="Search") {
            $scope.search('other')
        }

        if($scope.tabs.activeTab=="Invitations") {
            $http.get('/api/user/invitations/'+$rootScope.user._id).success(function(invitations){
                $scope.invitations = invitations;
            });
        }


    };

    $scope.$watch('tabs.activeTab',handleTabChange);

    $scope.signup = function() {
        $http.post('/api/users/get').success(function(data) {
            $scope.users = data;
            console.log(data);
        });
    };

    $scope.search = function(who) {
       if(who=="friends") 
         $http.get('/api/user/friends/'+$rootScope.user._id+'?q='+$scope.search.fusername).success(function(friends){
            $scope.friends = friends;
        });
        else
            $http.get('/api/users/get'+'?q='+$scope.search.ousername).success(function(users){
                $scope.users = users;

            });
    }


});
