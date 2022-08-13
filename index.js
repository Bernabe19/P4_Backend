const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true});
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors())
app.use(express.static('public'));
app.use("public",express.static(__dirname + "/public"));






//Schemas
const userSchema = new mongoose.Schema({
  username: String
});
const User = mongoose.model("User",userSchema);

const exerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectID,
    ref: 'User' 
  },
  description:{
    type:String,
    required:true
  },
  duration:{
    type:Number,
    required:true
  },
  date:String
});
const Exercise = mongoose.model("Exercise",exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', function(req, res, done){
  let user = new User({username:req.body.username});
  user.save(function(err,data){
    if(err){ console.log(err); return err;}
    res.json({username:user.username, _id: user.id});
    done(null,data)
  });
});

app.get('/api/users',function(req,res,done){
  User.find({}, function(err,users){
    if(err){ console.log(err); return err;}
    res.send(users);
  });
});

app.post('/api/users/:_id/exercises', function(req, res, done){
  let id = req.params._id;
  let date = req.body.date;
  let date1 = new Date();
  if(new Date(date)!= "Invalid Date"){
    date1 = new Date(date);
  }
  let datUsername = "";
  User.findById({_id:ObjectId(id)},function(err, data){
    if(err){console.log(err); return err;}
      datUsername = data.username;
      const exercise = new Exercise({user:id, description:req.body.description,duration:req.body.duration,date:date1});

      exercise.save(function(err,data){
        if(err){ console.log(err); return err;}
        res.json({_id:id,username:datUsername,date:date1.toDateString(),duration: exercise.duration,description:exercise.description});
        done(null,data)
      });
  });
});

app.get('/api/users/:_id/logs/:from?/:to?/:limit?',function(req,res){
  let userId = req.params._id;
  let from = req.params.from;
  let to = req.params.to;
  let limit = parseInt(req.query.limit);
  console.log(limit);
  User.findById({_id:ObjectId(userId)},function(err, user){
    if(err){console.log(err); return err;}
    let username = user.username;
    Exercise.find({user:userId},function(err,exercise){
      if(err){console.log(err); return err;}
      
      let log = [];
        for(let e of exercise){
          log.push({description:e.description,duration:e.duration,date:new Date(e.date).toDateString()});
        }
        if(limit!="NaN"){
          let fin = 0;
          console.log(log);
          while(fin < log.length){
            if(new Date(log[fin].date) < new Date(from) || new Date(log[fin].date) > new Date(to)){
              log.splice(fin,1);
              console.log(log);
            }
            fin++;
          }
          log.slice(0,limit);
          let count = log.length;
          res.json({_id:userId,username:username,count:count,log:log});   
      }
    });  
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + process.env.PORT);
});
