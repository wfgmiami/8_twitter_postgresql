const express = require('express');
const app = express();
const path = require('path');
const db = require('./db');
const swig = require('swig');
const bodyParser = require('body-parser');

app.set('view engine', 'html');
app.engine('html', swig.renderFile);
swig.setDefaults( { cache: false });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ exteneded: true }));

app.use('/vendors', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res, next) => {

  db.getAllTweets( (err, tweets) => {
    if(err) return next(err);
    //console.log(tweets)
    res.render('index', { tweets });
  })

})

app.get('/:name', (req,res,next) => {
  db.getTweetsByUser(req.params.name, (err, tweets) => {
    if(err) return next(err);
    //console.log(tweets)
    res.render('index', { tweets });
  })
})

app.post('/name/tweet', (req, res, next) => {
  var user = req.body.user;
  var tweet = req.body.tweet;

  db.createTweet(user, tweet, (err) => {
    if(err) console.log(err);
    res.redirect('/')
  })

})

app.use((error, req, res, next) => {
  res.send(error);
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${ port }`);
})

db.sync(( err, data ) => {

  if(!err){
    console.log('Sync error: ', err)
  }else{
    console.log('Sync completed')
  }

})
