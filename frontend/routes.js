app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    //do not use html5 mode!
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'modules/login/views/login.html',
            controller: 'LoginController'
        })

    .state('chat', {
        url: '/chat',
        templateUrl: 'modules/chat/views/chat.html'
    })


});
