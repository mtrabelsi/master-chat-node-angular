var chatModule = angular.module('module.chat', ['luegg.directives','angularMoment','ngSanitize','mgcrea.ngStrap','ngAnimate']);

chatModule.controller('ChatController', function($scope, $rootScope, Socket, $aside) {
window.chat_sc = $scope;

    $scope.rooms = [];
    $scope.time = new Date();

    $scope.selectedUsers = [];
    $scope.users = [];

    $scope.selectedUser = "";
    $scope.messageMode = {
        private : false
    };


    $scope.leaveDiscussion = function(leaveRoom) {
       Socket.emit("leave", {roomName: leaveRoom, who:$rootScope.user.username});
    }

    $scope.kick = function(member,kickRoom) {
      Socket.emit("kick", {roomName: kickRoom, kicked: member});
    }

    $scope.$watch('selectedUser', function() {
       if(typeof $scope.selectedUser == 'object'){
        $scope.messageMode.private = true;
       }
    });

   
    //this function will detect if the message is private or not
    $scope.fireSendMessage = function() {
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

      //  $scope.updateScroll();
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

    $rootScope.messages = [];

    Socket.on('msgFront', function (msg) {
        $scope.time = new Date();
        $rootScope.messages.push(msg);
    });

    Socket.on('pmsgFront', function (msg) {
        console.log('private ',msg);
            $scope.time = new Date();
            $rootScope.messages.push(msg);
    });
    
    $scope.sendMessage = function(msg) {
        console.log($rootScope.activeRoom);
        Socket.emit("msg", {nickname: $rootScope.user.username, message:msg, toRoom: $rootScope.activeRoom});
        $scope.tmpMessage = '';
    };

    $scope.createRoom = function() {
       //  Socket.emit("roomEvent", {roomName: $scope.room, join:true});
    }
    
    //    Socket.emit("roomEvent", {roomName: entredRoom, join:true, users:users, invite: $scope.button.invite});
    $scope.joinRoom = function(room) {
         Socket.emit("acceptInvite", {roomName: room, nickname: $rootScope.user.username});
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

         /*$rootScope.messages.push({
            message: 'You received an invitation from "'+invite.from+'"!',
            nickname: 'ROBOT'
         });*/
    });

  
    Socket.on('userList', function(data) {
        $scope.users = data.users;
    });


});


chatModule.directive('schrollBottom', function () {
  return {
    scope: {
      schrollBottom: "="
    },
    link: function (scope, element) {
      scope.$watchCollection('schrollBottom', function (newValue) {
        if (newValue) {
       //$(element).scrollTop($(element)[0].scrollHeight);

       //this is an animated version :)

       $(element).scrollTo($(element)[0].scrollHeight,300,{axis:'y'});
       //$(element).scrollTo('100%',300,{axis:'y'});

        }
      });
    }
  };

});