module.exports = ['$scope', 'MicrophoneService', function ($scope, MicrophoneService) {
    $scope.join = function () {
        MicrophoneService.join($scope.login, $scope.password).then(function (data) {
            console.log(data);
        });
    };
}];