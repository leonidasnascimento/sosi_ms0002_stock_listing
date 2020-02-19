const express = require('express');
const router = express.Router();
const stock_dao = require('../data/dal_stock');
const HttpStatus = require('http-status-codes');
const cacheDb = require("sosi_cache_db_manager");
const cacheDb_key = "sosi_ms0002_stock_listing.get_stock_code_list"

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
  var cacheDbMngr = new cacheDb(cacheDb_key)

  //Trying to get data from Redis
  cacheDbMngr.getValue(function (obj) {
    if (obj.data !== null) {
      res.status(HttpStatus.OK).send(JSON.parse(obj.data));
    } else {
      //Going to main db to retrieve the data if some error occurr when getting from Redis
      new stock_dao()
        .get_stock_code_list(function (data) {
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
  var cacheDbMngr = new cacheDb(cacheDb_key)
  var stock = new stock_dao()

  stock.get_stock_code_list(function (data) {
    cacheDbMngr.setValue(data, function (obj) {
      res.status(HttpStatus.OK).send(obj)
    }, function (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error)
    })
  }, function (data) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error)
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