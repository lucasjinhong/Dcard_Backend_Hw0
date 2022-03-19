var express = require("express");
var router = express.Router();
var short = require('shortid');
var mysql = require('mysql');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({limit: '50mb', extended: false});

var con = mysql.createConnection({
    host: "localhost",
    user: "lucasjh",
    password: "Jinhong253",
    database: "dcard_hw0"
});

router.post('/url',urlencodedParser, function(req, res, next) {
    response = 
    {
        url:req.body.url,
        expireAt:req.body.expireAt
    };

    var shortId = short();
    var shortenUrl = 'http://35.77.213.217:8000/' + shortId; 

    var sql = "INSERT INTO shorten_url VALUES (?)";
    var values = [shortId, shortenUrl, response.url, response.expireAt];
    con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    }); 

    console.log({_id:shortId, shortUrl:shortenUrl}, '\n');
    res.send({_id:shortId, shortUrl:shortenUrl}); 
});

router.get('/:url_id', function(req, res, next) {

    var url_id = req.params.url_id;
    console.log(url_id);

    var sql = 'SELECT url FROM shorten_url WHERE id_shorten = ' + mysql.escape(url_id);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log('\nResult sent');
        console.log(result[0].url);
        res.redirect(result[0].url);
    });     
});

module.exports = router;