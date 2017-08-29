const express = require('express');
const app = express();
const path = require('path');
const db = require('./db');
const swig = require('swig');

app.set('view engine', 'html');
app.engine('html', swig.renderFile);
swig.setDefaults( { cache: false });

app.use('/vendors', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res, next) => {

  db.getAllTweets( (err, tweets) => {
    //if(err) return next(err);
    console.log(tweets)
    res.render('index', tweets);
  })

})

app.get('/:name', (req,res,next) => {
  db.getTweetsByUser(req.params.name, (err, userTweets) => {
    if(err) return next(err);
    res.send(userTweets);
  })
})

app.use((error, req, res, next) => {
  res.send(erro);
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
