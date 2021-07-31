const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const app = express();

app.set("view engine","ejs")

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const port = process.env.PORT || 8080;

// JWT

const jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute:5,
          jwksUri: 'https://dev-h8is4dx5.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'testing-integration-api',
    algorithms: ['RS256']
});



// setting up mongo db

mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Articles",articleSchema);



///////////////////////////////////////////////// Getting,posting & Deleting all articles ////////////////////////////////////////////////////////////

app.get('/authorized',jwtCheck, function (req, res) {
    res.send('Secured Resource');
});


app.route("/articles")

.get(jwtCheck,function(req, res){
  Article.find(function(err, foundArticles){
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }
  });
})

.post(function(req, res){

  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });

  newArticle.save(function(err){
    if (!err){
      res.send("Successfully added a new article.");
    } else {
      res.send(err);
    }
  });
})

.delete(function(req, res){

  Article.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all articles.");
    } else {
      res.send(err);
    }
  });
});

///////////////////////////////////////////////// Getting,posting & Deleting specific articles ////////////////////////////////////////////////////////////

app.route("/articles/:articleTitle")

.get( function(req,res){
Article.findOne({title: req.params.articleTitle},function(err,foundArticles){
  if(!err){
    res.send(foundArticles);
  }
  else{
    res.send("No article matching this found");
  }
})
})

.put(function(req,res){
  Article.update(
    {title: req.params.articleTitle},
    {title: req.body.title, content: req.body.content},
    {overwrite:true},
    function(err){
      if(!err){
        res.send("Successfully updated informnation");
      }
      else{
        res.send(err);
      }
    }
  )
})
.patch(function(req,res){
  Article.update(
    {title: req.params.articleTitle},
    {$set: req.body},
    function(err){
      if(!err){
        res.send("Successfully updated informnation");
      }
      else{
        res.send(err);
      }
    }
  )
})
.delete(function(req,res){
  Article.deleteOne(
    {title: req.params.articleTitle},
    function(err){
    if(!err){
      res.send("Deleted Information Successfully");
    }
     else{
       res.send(err);
     }
    }
  )
});



app.listen(port, function() {
  console.log("Server started on port 3000");
});
