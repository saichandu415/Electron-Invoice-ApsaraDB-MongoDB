const bodyParser = require("body-parser");
const express = require("express");
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.post('/login', (req, res) => {
  // const username = req.body.username;
  // const password = req.body.password;
  // console.log(`POST request: username is ${username} and password is ${password}`);
  // res.end(`You are now logged in Mr(s) ${username}`);  
  console.log(req.body);   
  res.send(req.body);
});

app.listen(3000, () => {
  console.log("Started on http://localhost:3000");
});