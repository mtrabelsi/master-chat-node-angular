var chatModule = angular.module('module.chat', []);

chatModule.controller('ChatController', function($scope, $rootScope, Socket) {
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
        Socket.emit("msg", {nickname: $rootScope.nickname, message:msg});
    };

    $scope.createRoom = function() {
         Socket.emit("roomEvent", {roomName: $scope.room, join:true});
    }
    $scope.joinRoom = function(room) {
         Socket.emit("roomEvent", {roomName: room, join:true});
    }
    $scope.leaveRoom = function(room) {
         Socket.emit("roomEvent", {roomName: room, join:false});
    }




    Socket.on('roomList', function(data) {
        $scope.rooms = data.rooms;

    });


});
