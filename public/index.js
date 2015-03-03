angular.module('main', [])
    .service('MicrophoneService', require('./services/MicrophoneService'))
    .controller('MainController', require('./controllers/MainController'));