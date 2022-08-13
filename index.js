const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors())
app.use(express.static('public'));
app.use("public",express.static(__dirname + "/public"));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
//variables
const usuarios = {};
const ejercicios = {};

app.post('/api/users', function(req, res){
  let name = req.body.username;
  let id = req.params.id;
  res.json({username:name,_id:id});
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + process.env.PORT);
});
