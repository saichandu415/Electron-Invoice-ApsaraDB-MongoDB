const bodyParser = require("body-parser");
const express = require("express");
const app = express();
var uuid = require('node-uuid');
var http = require('http');
var fs = require('fs');
var sprintf = require("sprintf-js").sprintf;
var mongoClient = require('mongodb').MongoClient;


app.use(bodyParser.json());

// ApsaraDB for MongoDB related configurations
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

app.get('/data/dashboard', (req, res) => {
  var getData = getDashboardData();
  getData.then(function(result){
    res.status(200).send(result);
  },function(err){
    console.log(err);
    res.status(400).send(err);
  });
});

app.post('/data/invoice', (req, res) => {
  console.log(req.body);   
  var saveData = saveInvoiceData(req.body); 
  saveData.then(function(dbResponse){
    console.log(dbResponse);
    res.status(201).send(dbResponse);

  },function(err){
    console.log(err);
    res.status(400).send(err);
  });
});

function getDashboardData() {

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
            var collection = db.collection("saleData");
            collection.find({}).toArray(function (err, items) {
              if (err) {
                console.error('Unable to find data' + JSON.stringify(err));
              } else {
                console.info('data Fetched from MongoDB');
                var response = {}; 

                var datesArr = [];
                var salesArr = [];
                var ordersArr = [];

                var i =0;
                for(i=0; i<5; i++){
                  var totalSales = 0;
                var totalOrders = 0;
                  var d = new Date();
                  d.setDate(d.getDate() - i);
                  var month = d.getMonth() + 1;
                  var day = d.getDate();
                  var output = d.getFullYear() + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day;
                  datesArr.push(output);
                console.log("In Loop 1 : "+i);
                  for(var k=0; k<items.length; k++){
                    var item = items[k];
                    if(item.invoiceDate == output){
                      totalSales = totalSales + item.totalAmount;
                      totalOrders = totalOrders+1;
                    }
                  }
                  salesArr.push(totalSales);
                  ordersArr.push(totalOrders);
                }
                response.datesArr = datesArr;
                response.salesArr = salesArr;
                response.ordersArr = ordersArr;
                resolve(response);
              }
            });
          }
        });
      }
    });
  });
}

function saveInvoiceData(collectionData) {

  console.log(collectionData);
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
            var collection = db.collection("saleData");
            collection.insertOne(collectionData,function(err,result){
              if(err){
                reject(err);
              }else{
                resolve(result);
              }
            });
          }
        });
      }
    });
  });
}

http.createServer(app).listen(443, function () {
  console.log('Server for Invoice Backend running on port 443!');
});

