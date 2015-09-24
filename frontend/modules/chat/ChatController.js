var chatModule = angular.module('module.chat', []);

chatModule.controller('ChatController', function($scope,$rootScope, Socket) {
    $scope.rooms = [];

    Socket.emit("getRoomList", {});

    $scope.messages = [{
        message: 'Hi there, am a ROBOT! Enjoy with chat :p',
        nickname: 'ROBOT'
    }];

    Socket.on('msgFront', function (msg) {
            $scope.messages.push(msg);
    });
    
    $scope.sendMessage = function(msg) {
        Socket.emit("msg", {nickname: $rootScope.nickname ,message:msg});
    };

    $scope.createRoom = function() {
         Socket.emit("roomEvent", {roomName: $scope.room,join:true});
    }


    Socket.on('roomList', function(data) {
        $scope.rooms = [];

        Object.keys(data.rooms).forEach(function(key, val) {
            var owner = usernameById(data.users, key);
          
            $scope.rooms.push({
                name: key,
                owner: owner
            });
        });
    });

    function usernameById(cArray, id) {
        var ret = '';
        cArray.forEach(function(user) {
            if (user.id == id)
                ret = user.nickname;
        });
        return ret;
    }

});
