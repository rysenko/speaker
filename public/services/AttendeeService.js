module.exports = ['$http', '$rootScope', function ($http, $rootScope) {
    var BACKEND_URL = 'http://107.170.105.13/api/';
    var eventSocket = null;
    var token = null;

    this.join = function (login, password) {
        return $http({
            method: 'POST',
            url: BACKEND_URL + 'session/join',
            data: {
                login: login,
                password: password
            },
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            var payload = response && response.data && response.data.payload;
            token = payload && payload.token;
            var wsUrl = payload && payload.rtmUrl;
            if (wsUrl && token) {
                eventSocket = new WebSocket(wsUrl + '/?token=' + token);
                eventSocket.onmessage = function (event) {
                    var jsData = null;
                    try {
                        jsData = JSON.parse(event.data);
                    } catch (e) {};
                    if (jsData) {
                        $rootScope.$apply(function () {
                            $rootScope.$broadcast('socketUpdate', jsData);
                        });
                    }
                };
            }
            return payload;
        });
    };
    this.mute = function (userId) {
        return $http({
            method : 'PUT',
            url    : BACKEND_URL + 'mute/' + userId,
            data: {
                token: token
            },
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            return response.data;
        });
    };
    this.unmute = function (userId) {
        return $http({
            method : 'PUT',
            url    : BACKEND_URL + 'unmute/' + userId,
            data: {
                token: token
            },
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            return response.data;
        });
    };
}];