var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var pg = require('pg');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var router = express.Router();

router.get('/', function(req, res) {
  var options = {
    host: 'www.gw2spidy.com',
    port: 443,
    path: '/api/v0.9/json/types',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var onResult = function onResult(statusCode, result) {
    console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
    res.statusCode = statusCode;
    res.send(result);
  }

  var protocol = options.port == 443 ? https : http;
  var req = protocol.request(options, function(res)
  {
      var output = '';
      console.log(options.host + ':' + res.statusCode);
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
          output += chunk;
      });

      res.on('end', function() {
          var obj = JSON.parse(output);
          onResult(res.statusCode, obj);
      });
  });

  req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });

  req.end();
});

app.get('/', function (req, res) {
  res.send('Home!');
});



app.use('/api', router);

app.listen(port, function() {
  console.log('Example app listening on port ' + port + '!');
});
