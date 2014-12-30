angular.module('test', []).directive('greeting', function () {
  return {
    template: '<div>{{greeting}}</div>',
    //templateUrl: '../universal-search.html'
    controller: function($scope) {
    $scope.greeting = 'test';
    }
  };
});