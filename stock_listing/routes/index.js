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
  redis_mngr.get_value(redis_key_stock_code_list, function (obj) {    
    if (obj.data !== null) {
      console.info(obj.message)
      res.status(HttpStatus.OK).send(JSON.parse(obj.data));
    } else {
      //Going to main db to retrieve the data if some error occurr when getting from Redis
      new stock_dao()
        .get_stock_code_list(function (data) {
          console.log("Data was retrieved from main db")
          res.status(HttpStatus.OK).send(data);
        }, function (data) {
          res.status(HttpStatus.METHOD_FAILURE).send(data);
        });
    }
  }, function (obj) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(obj);
  })
});

/* UPDATE STOCK CODE LIST ON CACHE SERVER */
router.put('/stock_code_list', function (req, res, next) {
  var redis_mngr = new redis()
  var stock = new stock_dao()

  stock.get_stock_code_list(function (data) {
    redis_mngr.set_value(redis_key_stock_code_list, data, function (obj) {
      res.status(HttpStatus.OK).send(obj)
    }, function (e_data) {})
  }, function (data) {})
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