module.exports = ['$http', '$rootScope', function ($http, $rootScope) {
    var attendeeClient = new window.AttendeeClient('http://107.170.105.13/api/');

    this.join = function (login, password, callback) {
        attendeeClient.join(login, password, callback);
        attendeeClient.on('activeSpeaker', function (data) {
            $rootScope.$apply(function () {
                $rootScope.$broadcast('activeSpeaker', data);
            });
        });
        attendeeClient.on('muteState', function (data) {
            $rootScope.$apply(function () {
                $rootScope.$broadcast('muteState', data);
            });
        });
    };
    this.leave = function () {
        attendeeClient.leave();
    }
    this.mute = function (userId, callback) {
        attendeeClient.mute(userId, callback);
    };
    this.unmute = function (userId, callback) {
        attendeeClient.unmute(userId, callback);
    };
}];