var express = require("express");
var router = express.Router();
var short = require('shortid');
var mysql = require('mysql');

var bodyParser = require('body-parser');
const createError = require("http-errors");
var urlencodedParser = bodyParser.urlencoded({limit: '50mb', extended: false});

var con = mysql.createConnection({
    host: "localhost",
    user: "lucasjh",
    //password: "",
    password: "Jinhong253",
    database: "dcard_hw0"
});

router.post('/url',urlencodedParser, function(req, res, next) {
    response = 
    {
        url:req.body.url,
        expiredAt:req.body.expiredAt
    };

    var shortId = short(); //create a shorten_url by random

    //var shortenUrl = 'http://localhost:3000/' + shortId;
    var shortenUrl = 'http://35.77.213.217:3000/' + shortId;

    if(response.url == "" || response.expiredAt == ""){
        //if the response content got null
        return next(createError(422, 'url and expiredAt not to be null'));
    }
    else if(!/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?/g.test(response.expiredAt)){
        //if expiredAt is not the right datatype
        return next(createError(422, 'wrong date type')); 
    }

    var sql = "INSERT INTO shorten_url VALUES (?)";
    var values = [shortId, shortenUrl, response.url, response.expiredAt];
    con.query(sql, [values], function (err, result) {
        if (err) throw err;
    }); 

    res.send({_id:shortId, shorten_url:shortenUrl}); 
});

router.get('/:url_id', function(req, res, next) {

    var url_id = req.params.url_id;

    if(url_id.length != 9) 
    { 
        //when id_shorten is not equal to 9
        return next(createError(404, 'wrong length of shorten_url'))
    }

    var sql = 'SELECT * FROM shorten_url WHERE id_shorten = ' + mysql.escape(url_id);
    //var sql = 'SELECT * FROM shorten_url WHERE idshorten_url = ' + mysql.escape(url_id);

    con.query(sql, function (err, result) {
        if (err) throw err;

        if (result.length <= 0) 
        {
            //when it response a null, it doesn't exist
            return next(createError(404, "shorten_url doesn't exists"))
        }
        else if (result[0].expiredAt < new Date()) 
        {
            //when it expired, response 404
            return next(createError(404, 'shorten_url is expired'))
        }
        res.redirect(result[0].url); 
    });       
});

module.exports = router;