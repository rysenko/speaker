/**
 * This provides methods used for event handling
 *
 * @mixin
 * @module Main
 */
var Emitter = (/** @lends module:Main */function () {
    /**
     *
     * @param {object} obj Object to mix
     * @returns {object}
     * @constructor
     */
    function Emitter(obj) {
        if (obj) {
            for (var key in Emitter.prototype) {
                obj[key] = Emitter.prototype[key];
            }
            return obj;
        }
    };
    /**
     * Register a handler function to be called whenever this event is fired
     * @param {string} event Name of the event
     * @param {function} fn The handler to call
     */
    Emitter.prototype.on = function (event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
        return this;
    };
    /**
     * Register a handler function to be called only once
     * @param {string} event Name of the event
     * @param {function} fn The handler to call
     */
    Emitter.prototype.once = function (event, fn) {
        function on() {
            this.off(event, on);
            fn.apply(this, arguments);
        }
        on.fn = fn;
        this.on(event, on);
        return this;
    };
    /**
     * Unregister a handler function
     * @param {string} event Name of the event
     * @param {function} fn The handler
     */
    Emitter.prototype.off = function (event, fn) {
        this._callbacks = this._callbacks || {};
        // all
        if (0 === arguments.length) {
            this._callbacks = {};
            return this;
        }
        // specific event
        var callbacks = this._callbacks['$' + event];
        if (!callbacks) return this;
        // remove all handlers
        if (1 === arguments.length) {
            delete this._callbacks['$' + event];
            return this;
        }
        // remove specific handler
        for (var i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === fn) {
                callbacks.splice(i, 1);
                break;
            }
        }
        return this;
    };
    Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1);
        var callbacks = this._callbacks['$' + event];
        if (callbacks) {
            callbacks = callbacks.slice(0);
            for (var i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, args);
            }
        }
        return this;
    };
    Emitter.prototype.listeners = function(event){
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
    };
    return Emitter;
})();

var JsonConnection = (function () {
    function JsonConnection(url) {
        this.url = url;
    }
    JsonConnection.prototype._parseJson = function (data) {
        if (typeof data !== 'string') {
            return data;
        }
        var jsData = null;
        try {
            jsData = JSON.parse(data);
        } catch (e) {}
        return jsData;
    };
    return JsonConnection;
})();

var JsonRequest = (function (_super) {
    JsonRequest.prototype = Object.create(_super.prototype);
    function JsonRequest(method, url) {
        _super.call(this, url);
        this.method = method;
    }
    JsonRequest.prototype.send = function (payload, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = (function () {
            if (xhr.readyState === 4) {
                var responseObj = this._parseJson(xhr.responseText);
                if (xhr.status === 200) {
                    if (responseObj) {
                        callback(null, responseObj);
                    } else {
                        callback('No response received');
                    }
                } else {
                    callback(responseObj && responseObj.error || xhr.responseText || ('Error ' + xhr.status));
                }
            }
        }).bind(this);
        xhr.open(this.method, this.url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
    };
    return JsonRequest;
})(JsonConnection);

var JsonSocket = (function (_super) {
    JsonSocket.prototype = Object.create(_super.prototype);
    function JsonSocket(url) {
        _super.call(this, url);
        Emitter(JsonSocket.prototype);
        this.socket = new WebSocket(url);
        this.socket.onmessage = (function (event) {
            var jsData = this._parseJson(event.data);
            if (jsData) {
                this.emit('message', jsData);
            }
        }).bind(this);
    }
    JsonSocket.prototype.close = function () {
        if (this.socket) {
            this.socket.close();
        }
    };
    return JsonSocket;
})(JsonConnection);

/**
 * @module Main
 */
var AttendeeClient = (/** @lends module:Main */function () {
    /**
     * Client for communicating with API
     * @param apiUrl {string} API url
     * @constructor
     * @mixes module:Main~Emitter
     */
    function AttendeeClient(apiUrl) {
        Emitter(AttendeeClient.prototype);
        this.apiUrl = apiUrl;
    }
    AttendeeClient.prototype._safeRepeat = function (fn) {
        var callback = arguments[arguments.length - 1] || function () {};
        var args = Array.prototype.slice.call(arguments, 1, -1);
        var attempts = 5;
        var repeat = (function () {
            fn.apply(this, args);
        }).bind(this);
        args.push(function (err, response) {
            attempts -= 1;
            if (!err || attempts <= 0) {
                return callback(err, response);
            }
            repeat();
        });
        repeat();
    };
    AttendeeClient.prototype._join = function (login, password, callback) {
        new JsonRequest('POST', this.apiUrl + 'session/join').send({
            login: login,
            password: password
        }, (function (err, response) {
            var payload = response && response.payload;
            if (!err && !payload) {
                err = 'No payload received';
            }
            if (!err) {
                var wsUrl = payload.rtmUrl;
                this.token = payload.token;
                if (this.token && wsUrl) {
                    this.eventSocket = new JsonSocket(wsUrl + '/?token=' + this.token);
                    this.eventSocket.on('message', this._messageHandler.bind(this));
                }
            }
            callback(err, response);
        }).bind(this));
    };
    /**
     * Joins remote session as attendee
     * @param login {string} User login
     * @param password {string} User password in plain
     * @param callback {function} Node-style callback
     * @fires module:Main~AttendeeClient#activeSpeaker
     */
    AttendeeClient.prototype.join = function (login, password, callback) {
        if (this.token) {
            this.close();
        }
        this._safeRepeat(this._join, login, password, callback);
    };
    /**
     * Leaves remote session
     */
    AttendeeClient.prototype.leave = function () {
        if (this.eventSocket) {
            this.eventSocket.close();
        }
        this.token = null;
    };
    AttendeeClient.prototype._mute = function (id, callback) {
        new JsonRequest('PUT', this.apiUrl + 'mute/' + id).send({ token: this.token }, callback);
    };
    /**
     * Mutes user microphone
     * @param id {number} User identifier
     * @param callback {function} Node-style callback
     * @fires module:Main~AttendeeClient#muteState
     */
    AttendeeClient.prototype.mute = function (id, callback) {
        this._safeRepeat(this._mute, id, callback);
    };
    AttendeeClient.prototype._unmute = function (id, callback) {
        new JsonRequest('PUT', this.apiUrl + 'unmute/' + id).send({ token: this.token }, callback);
    };
    /**
     * Unmutes user microphone
     * @param id {number} User identifier
     * @param callback {function} Node-style callback
     * @fires module:Main~AttendeeClient#muteState
     */
    AttendeeClient.prototype.unmute = function (id, callback) {
        this._safeRepeat(this._unmute, id, callback);
    };
    AttendeeClient.prototype._messageHandler = function (data) {
        var payload = data && data.payload;
        var user = payload && payload.user;
        if (data.name) {
            user.id = Number(user.id); // id becomes string for muteState event
            if (data.name === 'muteState') {
                user.muted = payload.muted;
            }
            this.emit(data.name, user);
        }
    };
    /**
     * activeSpeaker event
     *
     * @event module:Main~AttendeeClient#activeSpeaker
     * @type {object}
     * @property {string} id User identifier
     */

    /**
     * muteState event
     *
     * @event module:Main~AttendeeClient#muteState
     * @type {object}
     * @property {string} id User identifier
     * @property {boolean} muted User muted state
     */
    return AttendeeClient;
})();

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.AttendeeClient = factory();
    }
}(this, function () {
    return AttendeeClient;
}));