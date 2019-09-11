let express = require('express');
let router = express.Router();
var stock_dao = require('../data/dal_stock');
var HttpStatus = require('http-status-codes');

/* GET */
router.get('/', function (req, res, next) {
  if (Object.keys(req.query).length === 0){
    res.redirect('swagger');
  }
  
  new stock_dao()
    .get_stock(req.query['code'], function (data) {
      res.status(HttpStatus.OK).send(data);
    }, function (data) {
      res.status(HttpStatus.METHOD_FAILURE).send(data);
    });
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