chatModule.controller('TabsController', function($q,$popover, $scope, $rootScope, $http, Socket) {
window.tab_sc = $scope;


    $scope.users = [];
    $scope.search = {
     
            fusername: '',
            ousername: ''
      
    };

    $rootScope.activeRoom = "" ;

    $scope.tags = [];

    $scope.popover = {title:'',members:[]};
    
    $scope.showRoomMember = function(roomName,users) {
        $scope.popover = {title:  roomName , members: users};
    }
//we need to test here if the room for the right or the left !!!!!!!!!!!!
    Socket.on('roomList', function(data) {
       $scope.roomsLeft  = data.rooms;
       $scope.roomsRight  = data.rooms;
       // alert("rooms received "+JSON.stringify(data));
    });

    $scope.createRoom = function(entredRoom, invite) {
        var users = [$rootScope.user.username];

       $scope.tags.forEach(function(tag) {
        users.push(tag.username)
       }) ;

        Socket.emit("roomEvent", {roomName: entredRoom, join:true, users:users, invite: invite});
       $scope.tags = [];
    }

    $scope.loadUsers = function() {
        return $http.get('/api/user/friends/'+$rootScope.user._id+'?q='+$scope.search.fusername);
    }


    $scope.tabsLeft = [{
        "title": "Discussion",
        "page": "modules/chat/views/tabs/roomsLeft.html"
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
    $scope.changeTabLeft = function(tab){
        $scope.tabsLeft.activeTab = tab;
    }

    $scope.tabsRight = [{
        "title": "Chat Rooms",
        "page": "modules/chat/views/tabs/roomsRight.html"
    }];
    $scope.changeTabRight = function(tab){
        $scope.tabsRight.activeTab = tab;
    }

    $scope.unfriend = function(userId) {
        console.log(userId);
          $http.put('/api/user/unfriend/'+$rootScope.user._id,{reqesterId: userId}).success(function(user){
               $http.get('/api/user/friends/'+$rootScope.user._id).success(function(friends){
                    $scope.friends = friends;
                });
            });
    }

    $scope.startConversation = function(fUsername) {
        var arr = [$rootScope.user.username,fUsername];
       
        $http.post('/api/room/create',{users: arr}).success(function(data){
                    $scope.tabsLeft.activeTab = 'Discussion';
                    arr = arr.sort();
                    var switchedRoom = "["+arr.toString()+"]";
                    $scope.setCurrentRoom(switchedRoom);

                $http.get('/api/messages/'+switchedRoom).success(function(msgs){
                        $rootScope.messages = msgs;
                });
        });
    }
    $scope.setCurrentRoom = function(clickedRoom) {
        $rootScope.activeRoom = clickedRoom;
    }

    $scope.loadMessages = function(clickedRoom) {
        $http.get('/api/messages/'+clickedRoom).success(function(msgs){
            $rootScope.messages = msgs;
        });
     // alert('loaded msg for '+clickedRoom);
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

    $scope.tabsLeft.activeTab = "Discussion";
    $scope.tabsRight.activeTab = "Chat Rooms";

    var handleTabLeftChange = function() {
        if($scope.tabsLeft.activeTab=="Friends") {
            $scope.search('friends');
        }

        if($scope.tabsLeft.activeTab=="Search") {
            $scope.search('other')
        }

        if($scope.tabsLeft.activeTab=="Invitations") {
            $http.get('/api/user/invitations/'+$rootScope.user._id).success(function(invitations){
                $scope.invitations = invitations;
            });
        }

       if($scope.tabsLeft.activeTab=="Discussion") {
            $http.get('/api/room/'+$rootScope.user.username).success(function(rms){
                $scope.roomsLeft = rms;
            });
        }
    };

    var handleTabRightChange = function() {
        if($scope.tabsRight.activeTab=="Friends") {
            $scope.search('friends');
        }

       if($scope.tabsRight.activeTab=="Chat Rooms") {
            $http.get('/api/room/'+$rootScope.user.username).success(function(rms){
                $scope.roomsRight = rms;
            });
        }
    };

    $scope.$watch('tabsLeft.activeTab',handleTabLeftChange);
    $scope.$watch('tabsRight.activeTab',handleTabRightChange);

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
            $http.get('/api/users/get'+'?q='+$scope.search.ousername+'&me='+$rootScope.user._id).success(function(users){
                $scope.users = users;
             
            });
    }


});
