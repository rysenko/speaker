angular.module('main', [])
    .service('AttendeeService', require('./services/AttendeeService'))
    .controller('MainController', require('./controllers/MainController'));