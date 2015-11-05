 chatModule.factory('Socket', function($rootScope) {


     var socket = io.connect('http://localhost:8080', {
            query: "nickname="+$rootScope.user.username+"&roomName=MyRoom"
     });

     return {

         on: function(eventName, callback) {
             function wrapper() {
                 var args = arguments;
                 $rootScope.$apply(function() {
                     callback.apply(socket, args);
                 });
             }

             socket.on(eventName, wrapper);

             return function() {
                 socket.removeListener(eventName, wrapper);
             };
         },

         emit: function(eventName, data, callback) {
             socket.emit(eventName, data, function() {
                 var args = arguments;
                 $rootScope.$apply(function() {
                     if (callback) {
                         callback.apply(socket, args);
                     }
                 });
             });
         },

         id: function() {
             return socket.io.engine.id;
         }

     };

 });
