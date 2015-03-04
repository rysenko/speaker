module.exports = ['$scope', 'AttendeeService', function ($scope, AttendeeService) {
    $scope.users = {};

    $scope.join = function () {
        $scope.loading = true;
        AttendeeService.join($scope.login, $scope.password, function () {
            $scope.loading = false;
            $scope.joined = true;
        });
    };

    $scope.leave = function () {
        AttendeeService.leave();
        $scope.joined = false;
    };

    $scope.toggle = function (user) {
        if (user.muted) {
            AttendeeService.unmute(user.id);
        } else {
            AttendeeService.mute(user.id);
        }
    };

    //TODO: Unify to one common userUpdate event
    $scope.$on('activeSpeaker', function (event, user) {
        $scope.users[user.id] = $scope.users[user.id] || {};
        angular.extend($scope.users[user.id], user);
    });

    $scope.$on('muteState', function (event, user) {
        $scope.users[user.id] = $scope.users[user.id] || {};
        angular.extend($scope.users[user.id], user);
    });
}];