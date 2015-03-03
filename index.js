var express = require('express');
var browserify = require('browserify');

var app = express();
app.use(express.static(__dirname + '/public'));

app.get('/main.js', function (req, res) {
    res.set('Content-Type', 'text/javascript');
    browserify().add('./public/index.js').bundle().pipe(res);
});

var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});