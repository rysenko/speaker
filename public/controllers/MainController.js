module.exports = ['$scope', 'AttendeeService', function ($scope, AttendeeService) {
    $scope.users = {};

    $scope.join = function () {
        AttendeeService.join($scope.login, $scope.password).then(function (data) {
            console.log(data);
        });
    };

    $scope.toggle = function (user) {
        if (user.muted) {
            AttendeeService.unmute(user.id);
        } else {
            AttendeeService.mute(user.id);
        }
    };

    $scope.$on('socketUpdate', function (event, data) {
        var payload = data && data.payload;
        var user = payload && payload.user;
        $scope.users[user.id] = $scope.users[user.id] || {};
        if (data.name === 'muteState') {
            user.muted = payload.muted;
        }
        angular.extend($scope.users[user.id], user);
    });
}];