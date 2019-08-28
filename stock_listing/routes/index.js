let express = require('express');
let router = express.Router();
var stock_dao = require('../data/dal_stock');

/* GET */
router.get('/', function(req, res, next) {
  res.send('GET - Not Implemented')
});

/* POST */
router.post('/', function(req, res, next){
  obj = new stock_dao().add_stock(req.body)
  res.send(obj)
});

/* DELETE */
router.delete('/', function(req, res, next){
  res.send('DELETE - Not Implemented')
})

module.exports = router;
