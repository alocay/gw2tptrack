var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var pg = require('pg');
var query = require('pg-query');
var path = require('path');
var async = require('async');

var production = !!process.env.DATABASE_URL;
var port = process.env.PORT || 3000;
var dburl = process.env.DATABASE_URL || 'postgres://qdowfxbkxxzbmz:csxMzsTDGDw_jhDtDl87u_afGo@ec2-54-243-231-255.compute-1.amazonaws.com:5432/d2ghfft6urjrgo?ssl=true';
var router = express.Router();
var contentPath = production ? path.join(__dirname, 'dist') : path.join(__dirname, 'dev');

const LISTING_FEE = 0.05;
const TRANSACTION_FEE = 0.1;
const TOTAL_FEES = LISTING_FEE + TRANSACTION_FEE;
const REAL_REVENUE_FACTOR = 1 - TOTAL_FEES;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

query.connectionParameters = dburl;

if (production) {
  app.use(express.static(path.join(__dirname, 'dist')));
} else {
  app.use(express.static(path.join(__dirname, 'dev')));
}

var getJSON = function getJSON(path, callback, errorCallback) {
  var options = {
    host: 'www.gw2spidy.com',
    port: 80,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var protocol = options.port == 443 ? https : http;
  var req = protocol.request(options, function(res)  {
    var output = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
        output += chunk;
    });

    res.on('end', function() {
        var obj = JSON.parse(output);
        callback(res.statusCode, obj);
    });
  });

  req.on('error', function(err) {
      if (errorCallback) errorCallback(err);
  });

  req.end();
};

router.get('/types', function(req, res) {
  query('SELECT * FROM types', function(err, rows, result) {
    res.send(result.rows);
  });
});

router.get('/items', function(req, res) {
  query('SELECT * FROM items', function(err, rows, result) {
    res.send(result.rows);
  });
});

router.get('/items/data', function(req, res) {
  var itemdata = [];
  var apiRequests = [];

  console.log('Getting all items market data');

  var getRequestFunction = function(dataid) {
    return function(next) {
      // Get item data JSON
      getJSON('/api/v0.9/json/item/' + dataid, function onSuccess(statusCode, data) {
        // Calculate flip profit
        var item = data.result;
        var flipProfit = (item.min_sale_unit_price * REAL_REVENUE_FACTOR) - item.max_offer_unit_price; // - (Math.max(1, (item.min_sale_unit_price * LISTING_FEE))) - (Math.max(1, (item.min_sale_unit_price * TRANSACTION_FEE)));
        item.flipProfit = flipProfit;
        next(null, item);
      }, function (err) {
        console.log('Get JSON error: ' + err);
      });
    }
  };

  // Create all requests
  query('SELECT * FROM items', function(err, rows, result) {
    for(var i = 0; i < result.rows.length; i++) {
      var dataid = result.rows[i].id;
      apiRequests.push(getRequestFunction(dataid));
    }

    console.log('Preparing to request...');
    // Kick off requests in parallel
    async.parallel(apiRequests, function (err, results) {
      if (err) { console.log('error: ' + err); }
      console.log('Queries complete. Responding...');
      res.send(results);
    });
  });
});

router.get('/item/:id/data', function(req, res) {
  // call api .../api/v0.9/json/item/{dataid} for the id given
});

router.get('/orders', function (req, res) {
  console.log('Getting orders...');
  query('SELECT * FROM orders', function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send(err);
    }
    res.send(result.rows);
  });
});

router.post('/orders/create', function(req, res) {
  var order = req.body;
  order.data_id = 1;
  console.log('Inserting an order to the database...');
  query('INSERT INTO orders (id, name, data_id, date_ordered, buy_price, amount_ordered, predicted_sell_unit_price) VALUES ($1::uuid, $2::text, $3::integer, $4::date, $5::integer, $6::integer, $7::integer)',
    [order.id, order.name, order.data_id, order.date_ordered, order.buy_price, order.amount_ordered, order.predicted_sell_unit_price], function(err, rows, result) {
      if(err) {
        return console.error('error running insert query for order ' + order.name + ' ' + order.date_ordered + ' ' + order.amount_ordered, err);
      }

      res.send(order);
  });
});

router.post('/orders/update', function(req, res) {
  var orders = req.body;

  if (!orders || orders.length <= 0) { res.send({}); return; }

  console.log('Updating orders...');
  var updateQuery = 'UPDATE orders as o SET date_filled = c.date_filled, buy_price = c.buy_price, amount_ordered = c.amount_ordered, predicted_sell_unit_price = c.predicted_sell_unit_price, ' +
    'amount_filled = c.amount_filled, actual_sell_unit_price = c.actual_sell_unit_price, date_sold = c.date_sold, date_ordered = c.date_ordered, amount_sold = c.amount_sold, amount_listed = c.amount_listed from (values ';

  var count = 1;
  var flatorders = [];
  for(var i = 0; i < orders.length; i++) {
    var values = '($' + (count++) + '::uuid, $' + (count++) + '::date, $' + (count++) + '::integer, $' + (count++) + '::integer, $' + (count++) + '::integer, $' + (count++) +
       '::integer, $' + (count++) + '::integer, $' + (count++) + '::date, $' + (count++) + '::date, $' + (count++) + '::integer, $' + (count++) + ':integer)';

    if ((i+1) < orders.length) {
      values += ',';
    }

    updateQuery += values;

    flatorders = flatorders.concat([orders[i].id, orders[i].date_filled, orders[i].buy_price, orders[i].amount_ordered, orders[i].predicted_sell_unit_price,
      orders[i].amount_filled, orders[i].actual_sell_unit_price, orders[i].date_sold, orders[i].date_ordered, orders[i].amount_sold, orders[i].amount_listed]);
  }

  updateQuery += ') AS c(id, date_filled,buy_price,amount_ordered,predicted_sell_unit_price,amount_filled,actual_sell_unit_price,date_sold,date_ordered,amount_sold,amount_listed) WHERE c.id = o.id';

  console.log(updateQuery);
  query(updateQuery, flatorders, function(err, rows, result) {
      if(err) {
        return console.error('error running update query for orders', err);
      }

      res.send(orders);
  });
});

/*app.get('/', function (req, res) {
  res.send('Home!');
});*/

/*app.get('/check', function (req, res) {
  query.connectionParameters = dburl;
  query('SELECT * FROM items', function(err, rows, result) {
    for(var i = 0; i < result.rows.length; i++) {
      var item = result.rows[i]
      console.log(item.name + ' (' + item.id + ')');
    }
  });
});*/

var loadtypes = function loadtypes() {
  var onSuccess = function onSuccess(statusCode, result) {
    query.connectionParameters = dburl;

    for(var i = 0; i < result.results.length; i++) {
      var type = result.results[i];

      console.log('inserting ' + type.name + '(' + type.id + ')');

      query('INSERT INTO types (id, name) SELECT $1, CAST($2 AS VARCHAR) WHERE NOT EXISTS (SELECT id, name FROM types WHERE id=$1 and name=$2)', [type.id, type.name], function(err, rows, result) {
        if(err) {
          return console.error('error running query for ' + type.id + ' ' + type.name, err);
        }
      });
    }
  };

  getJSON('/api/v0.9/json/types', onSuccess);
};

/*var loadrarity = function loadrarity() {
  var onSuccess = function onSuccess(statusCode, result) {
    query.connectionParameters = dburl;

    for(var i = 0; i < result.results.length; i++) {
      var rarity = result.results[i];

      console.log('inserting ' + rarity.name + '(' + rarity.id + ')');

      query('INSERT INTO rarity (id, name) SELECT $1, CAST($2 AS VARCHAR) WHERE NOT EXISTS (SELECT id, name FROM types WHERE id=$1 and name=$2)', [rarity.id, rarity.name], function(err, rows, result) {
        if(err) {
          return console.error('error running query for ' + rarity.id + ' ' + rarity.name, err);
        }
      });
    }
  };

  getJSON('/api/v0.9/json/rarities', onSuccess);
};*/

/*var loaditems = function loaditems() {
  var onSuccess = function onSuccess(statusCode, result) {
    query.connectionParameters = dburl;

    for(var i = 0; i < result.results.length; i++) {
      var item = result.results[i];

      console.log('inserting ' + item.name + '(' + item.id + ')');

      query('INSERT INTO items (id, name, rarity_id, image, type_id, sub_type_id) SELECT $1, CAST($2 AS VARCHAR), $3, CAST($4 AS VARCHAR), $5, $6 WHERE NOT EXISTS (SELECT id FROM items WHERE id=$1)',
        [item.data_id, item.name, item.rarity, item.img, item.type_id, item.sub_type_id], function(err, rows, result) {
        if(err) {
          console.log(JSON.stringify(item));
          return console.error('error running query for ' + item.id + ' ' + item.name, err);
        }
      });
    }
  };

  getJSON('/api/v0.9/json/all-items/all', onSuccess);
};*/

app.get('/load', function (req, res) {
  //loadtypes();
  res.send('Loading data...');
});

app.use('/api', router);

app.get('*', function(req, res) {
  res.sendFile(path.join(contentPath, 'index.html'));
});

app.listen(port, function() {
  console.log('Example app listening on port ' + port + '!');
});
