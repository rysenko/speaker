module.exports = function (config) {
    config.set({
        basePath: './public',
        files: [
            'lib/attendee.js',
            'spec/*.js'
        ],
        frameworks: ['jasmine'],
        browsers: ['Chrome'],
        singleRun: true
    });
};