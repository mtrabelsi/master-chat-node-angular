// chatModule.directive('schrollBottom', function () {
//   return {
//     scope: {
//       schrollBottom: "="
//     },
//     link: function (scope, element) {
//       scope.$watchCollection('schrollBottom', function (newValue) {
//         if (newValue) {
//        $(element).scrollTop($(element)[0].scrollHeight);

//        //this is an animated version :)
//       // $(element).scrollTo('100%',300,{axis:'y'});

//         }
//       });
//     }
//   }
// });
chatModule.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        // scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        // });
                        
                        event.preventDefault();
                }
            });
        };
});