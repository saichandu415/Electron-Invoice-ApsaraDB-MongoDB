'use strict'

var express = require('express');
var formidable = require('formidable');
var uuid = require('node-uuid');
var https = require('https');
var http = require('http');
var fs = require('fs');
var sprintf = require("sprintf-js").sprintf;
var mongoClient = require('mongodb').MongoClient;
var dummyJson = require('./json/dummyvalue.json');
var bodyParser = require('body-parser');


var app = express();


//code to enable https
var sslOptions = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
  passphrase: 'saisarath'
};

//Mongo DB Instance Details
// var url = 'mongodb://root:Iam0_winner@dds-6gj900975f5d1dd41.mongodb.ap-south-1.rds.aliyuncs.com:3717,dds-6gj900975f5d1dd42.mongodb.ap-south-1.rds.aliyuncs.com:3717/admin?replicaSet=mgset-1050000426';
var host1 = "dds-6gj54086e0c157941.mongodb.ap-south-1.rds.aliyuncs.com";
var port1 = 3717;
var host2 = "dds-6gj54086e0c157942.mongodb.ap-south-1.rds.aliyuncs.com";
var port2 = 3717;
var username = "root";
var password = "Mongodb123";
var replSetName = "mgset-1050000641";
var demoDb = "admin";

var url = sprintf("mongodb://%s:%d,%s:%d/%s?replicaSet=%s", host1, port1, host2, port2, demoDb, replSetName);

console.info("url generated:", url);

app.get('/ampdemo/getData', function (req, res) {

  //Headers to make AMP Accept
  res.setHeader('AMP-Access-Control-Allow-Source-Origin','http://127.0.0.1:8000');
  res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:8000');

  console.log(JSON.stringify(req.query));

  if (req.query && req.query.selection) {
    //call promise and fetch data
    var getData = fetchFromMongo(req.query.selection);
    getData.then(function (dataFrmDB) {
      //create response object
      var response = {};
      response.items = dataFrmDB;
      res.status(200).json(response);
    }, function (err) {
      res.status(400).json(err);
    });
  } else {
    res.status(400).json({ error: 'Please choose a selection' });
  }
});

app.post('/samplePost',function(req,res){
// console.log(req); 
var response = {};
      // response.items = req;
      console.log(req.body);
      res.send(req.body);
      res.end();

});

// app.use('/', express.static('static'));
app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true }));

// http.createServer(app).listen(8080, function () {
//   console.log('Server for "Advanced Interactivity in AMP" codelab listening on port 443!');
// });

app.listen(3000,function(){
  console.log("Started on PORT 3000");
})


function fetchFromMongo(collection) {

  var coll2Fetch = collection;

  return new Promise(function (resolve, reject) {
    // Logic to fetch from the MongoDB
    mongoClient.connect(url, function (err, db) {
      //if error console error
      console.log(err);
      if (err) {
        // Database not connected : error thrown
        console.error("connect err:", err);
        reject(err);
      } else {
        //Database connected successfully, get the DB Object
        var adminDb = db.admin();
        //Authenticate Database
        adminDb.authenticate(username, password, function (err, result) {
          if (err) {
            console.log("authenticate err:", JSON.stringyfy(err));
            reject(err);
          } else {
            console.log('Authenticated : ', JSON.stringify(result));
            // Get the Collection handle.
            var collection = db.collection(coll2Fetch);
            collection.find({}).toArray(function (err, items) {
              if (err) {
                console.error('Unable to find data' + JSON.stringify(err));
              } else {
                console.info('data Fetched from MongoDB');
                resolve(items);
              }
            });
          }
        });
      }
    });
  });
}

