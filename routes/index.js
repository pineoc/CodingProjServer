var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/default_iframe',function(req,res,next){
  res.render('default_iframe',{status:'s'});
});

module.exports = router;
