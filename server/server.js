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

var config = {
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

pool.connect(process.env.DATABASE_URL, function(err, client, done) {
  if (err) {
    return console.error('error fetching client from pool', err);
  }
  else {
    console.log('got client from pool');
  }
});

pool.on('error', function(err, client) {
  console.error('idle client error', err.message, err.stack);
});

app.use('/api', router);

app.listen(port, function() {
  console.log('Example app listening on port ' + port + '!');
});
