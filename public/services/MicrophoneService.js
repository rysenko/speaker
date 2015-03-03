module.exports = ['$http', function ($http) {
    var BACKEND_URL = 'http://107.170.105.13/api/';
    var eventSocket = null;

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
            var wsUrl = payload && payload.rtmUrl;
            var token = payload && payload.token;
            if (wsUrl && token) {
                eventSocket = new WebSocket(wsUrl + '/?token=' + token);
                eventSocket.onmessage = function (event) {
                    console.log(event.data);
                };
            }
            return payload;
        });
    };
    this.mute = function (userId) {
        return $http({
            method : 'PUT',
            url    : '/mute/' + userId
        }).then(function (response) {
            //TODO: Handle response status
            return response.data;
        });
    };
    this.unmute = function (userId) {
        return $http({
            method : 'PUT',
            url    : '/mute/' + userId
        }).then(function (response) {
            //TODO: Handle response status
            return response.data;
        });
    };
}];