angular.module('test').directive('test', function () {
  return {
    templateUrl: '../test.html',
    controller: function($scope) {
      $scope.greeting = 'test';
    }
  };
});