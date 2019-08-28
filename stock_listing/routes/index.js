let express = require('express');
let router = express.Router();
var stock_dao = require('../data/dal_stock');
var HttpStatus = require('http-status-codes');

/* GET */
router.get('/', function (req, res, next) {
  res.send('GET - Not Implemented')
});

/* POST */
router.post('/', function (req, res, next) {
  var obj = new stock_dao().add_stock(req.body)
  var statusCode = HttpStatus.OK
  var msg = ''

  obj
    .catch((reason) => {
      statusCode = HttpStatus.METHOD_FAILURE
      msg = reason
    })
    .then((result) => {

      if (msg === '') {
        msg = result
      }

      res.status(statusCode).send(msg)
    });
});

/* DELETE */
router.delete('/', function (req, res, next) {
  res.send('DELETE - Not Implemented')
})

module.exports = router;