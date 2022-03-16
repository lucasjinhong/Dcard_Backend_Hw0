var express = require("express");
var router = express.Router();
var short = require('shortid');
var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({limit: '50mb', extended: false});

router.post('/url',urlencodedParser, function(req, res, next) {
    response = 
    {
        url:req.body.url,
        expireAt:req.body.expireAt
    };

    var shortId = short();
    var shortenUrl = 'http://localhost:8000/' + shortId; 

    res.send({_id:shortId, shortUrl:shortenUrl}); 

    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Dcard_Backend");
        var myobj = [{_id:shortId, url:response.url, expireAt:response.expireAt, shortUrl:shortenUrl}];
        dbo.collection("url").insertMany(myobj, function(err, res) {
          if (err) throw err;
          console.log(res, '\n' , {_id:shortId, shortUrl:shortenUrl}, '\n');
          db.close();
        });
    });
});

router.get('/:url_id', function(req, res, next) {

    var url_id = req.params.url_id;
    console.log(url_id);

    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Dcard_Backend");
  
        var query = {_id: url_id};
  
        dbo.collection("url").find(query).toArray(function(err, result) {
          if (err) throw err;
          db.close();
          console.log('\nResult sent');
          console.log(result[0].url);
          res.redirect(result[0].url);
        });
    });
});

module.exports = router;