module.exports = ['$scope', 'AttendeeService', function ($scope, AttendeeService) {
    $scope.users = {};

    $scope.join = function () {
        $scope.loading = true;
        AttendeeService.join($scope.login, $scope.password, function (err, response) {
            if (err) {
                return alert(err);
            }
            $scope.name = response && response.payload && response.payload.user && response.payload.user.name;
            $scope.loading = false;
            $scope.joined = true;
        });
    };

    $scope.leave = function () {
        AttendeeService.leave();
        $scope.users = {};
        $scope.joined = false;
    };

    $scope.toggle = function (user) {
        var callback = function (err) {
            if (err) {
                alert(err);
            }
        };
        if (user.muted) {
            AttendeeService.unmute(user.id, callback);
        } else {
            AttendeeService.mute(user.id, callback);
        }
    };

    $scope.$on('activeSpeaker', function (event, user) {
        $scope.users[user.id] = $scope.users[user.id] || {};
        angular.extend($scope.users[user.id], user);
    });

    $scope.$on('muteState', function (event, user) {
        $scope.users[user.id] = user;
    });
}];