var chatModule = angular.module('module.chat', ['angularMoment','ngSanitize','mgcrea.ngStrap','ngAnimate']);

chatModule.controller('ChatController', function($scope, $rootScope, Socket, $aside) {
    $scope.rooms = [];
    $scope.time = new Date();

    $scope.selectedUsers = [];
    $scope.users = [];

    $scope.selectedUser = "";
    $scope.messageMode = {
        private : false
    };

    $scope.$watch('selectedUser', function() {
       if(typeof $scope.selectedUser == 'object'){
        $scope.messageMode.private = true;
       }
    });

    //this function will detect if the message is private or not
    $scope.fireSendMessage = function(){
        if(typeof $scope.selectedUser !='object') {
            if($scope.messageMode.private==true){
                var splitSelected = $scope.selectedUser.split(":");
                $scope.sendPrivateMessage(splitSelected[0],splitSelected[1]);
                //reset it to the default value ( normal mode )
                $scope.messageMode.private = false;
                $scope.selectedUser = '';

            }else{
                $scope.sendMessage($scope.selectedUser);
                $scope.selectedUser = '';

            }
        }
    }

    $scope.sendPrivateMessage = function(to,msg) {
            Socket.emit("pmsg", {to: to, message:msg});
            $scope.tmpMessage = '';

    };

    $scope.aside = {
      title:'',
      text: '',
      invitedRoom: ''
    };

    var aside = $aside({scope: $scope, show: false, templateUrl: 'modules/chat/views/chatbox.html'});
    $scope.showChatBox = showChatBox;

     function showChatBox()  {
            // use $promise property to ensure the template has been loaded
            aside.$promise.then(function() {
            aside.show();
          })
     }

    Socket.emit("getRoomList", {});
    Socket.emit("getUserList", {});

    $scope.messages = [{
        message: 'Hi there, am a ROBOT! Enjoy with chat :p',
        nickname: 'ROBOT'
    }];

    Socket.on('msgFront', function (msg) {
        $scope.time = new Date();
        $scope.messages.push(msg);
    });

    Socket.on('pmsgFront', function (msg) {
        console.log('private ',msg);
            $scope.time = new Date();
            $scope.messages.push(msg);
    });
    
    $scope.sendMessage = function(msg) {
        Socket.emit("msg", {nickname: $rootScope.nickname, message:msg});
        $scope.tmpMessage = '';
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

    $scope.invite = function(){
         Socket.emit("invite", $scope.selectedUsers);
    }


    Socket.on('inviteFront', function(invite) {
        $scope.aside.title = invite.from+' invitation';
        $scope.aside.invitedRoom = invite.room;
        $scope.aside.text = 'You received a chat invitation from "'+invite.from+'" click on "Accept" to accept it or on "Refuse" to delete it.';
        showChatBox();

         $scope.messages.push({
            message: 'You received an invitation from "'+invite.from+'"!',
            nickname: 'ROBOT'
         });
    });

    Socket.on('roomList', function(data) {
        $scope.rooms = data.rooms;
    });

    Socket.on('userList', function(data) {
        $scope.users = data.users;
    });


});
