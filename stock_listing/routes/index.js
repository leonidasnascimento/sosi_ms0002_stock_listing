const express = require('express');
const router = express.Router();
const stock_dao = require('../data/dal_stock');
const HttpStatus = require('http-status-codes');
const redis = require('../data/redis_manager')

const redis_key_stock_code_list = "sosi_ms0002_stock_listing.get_stock_code_list"

/* GET */
router.get('/', function (req, res, next) {
  if (Object.keys(req.query).length === 0) {
    res.redirect('swagger');
  }

  new stock_dao()
    .get_stock(req.query['code'], function (data) {
      res.status(HttpStatus.OK).send(data);
    }, function (data) {
      res.status(HttpStatus.METHOD_FAILURE).send(data);
    });
});

/* GET STOCKS CVM CODE*/
router.get('/stocks_cvm_code', function (req, res, next) {
  new stock_dao()
    .get_stocks_cvm_code(function (data) {
      res.status(HttpStatus.OK).send(data);
    }, function (data) {
      res.status(HttpStatus.METHOD_FAILURE).send(data);
    });
});

/* GET STOCK CODE LIST */
router.get('/stock_code_list', function (req, res, next) {
  var redis_mngr = new redis()

  //Trying to get data from Redis
  redis_mngr.get_key_json_value(redis_key_stock_code_list, function (s_data) {
    if (s_data !== null) {
      console.log("Data was retrieved from Redis...")
      res.status(HttpStatus.OK).send(JSON.parse(s_data));
    } else {
      //Going to main db to retrieve the data. Then, save this data to Redis
      new stock_dao()
        .get_stock_code_list(function (data) {
          console.log("Data was retrieved from main db...")
          //Adding data to Redis
          redis_mngr.set_key_json_value(redis_key_stock_code_list, data, function (s_data) {
            res.status(HttpStatus.OK).send(data);
          }, function (e_data) {
            console.error(e_data)
          })
        }, function (data) {
          res.status(HttpStatus.METHOD_FAILURE).send(data);
        });
    }
  }, function (e_data) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e_data);
  })
});

/* POST */
router.post('/', function (req, res, next) {
  new stock_dao()
    .add_stock(req.body, function (data) {
      res.status(HttpStatus.OK).send(data);
    }, function (data) {
      res.status(HttpStatus.METHOD_FAILURE).send(data);
    });
});

/* DELETE */
router.delete('/', function (req, res, next) {
  new stock_dao()
    .delete_stock(req.query['code'], function (data) {
      res.status(HttpStatus.OK).send(data);
    }, function (data) {
      res.status(HttpStatus.METHOD_FAILURE).send(data);
    })
})

module.exports = router;