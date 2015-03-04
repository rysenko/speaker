window.AttendeeClient = require('./lib/attendee.js');
angular.module('main', [])
    .service('AttendeeService', require('./services/AttendeeService'))
    .controller('MainController', require('./controllers/MainController'));