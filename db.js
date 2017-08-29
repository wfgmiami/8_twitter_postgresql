const pg = require('pg');
const fs = require('fs');

const seedfile = (cb) => {
  fs.readFile('./seedfile.sql', 'utf8', (err, result) => {
    if(err) return cb(err);
    else cb(null, result)
  })
}

let _client;

const connect = (cb) => {
  if(_client){
    cb(null, _client)
  }
  const client = new pg.Client(process.env.DATABASE_URL);
  client.connect( (err, client) => {
    if(err) cb(err);

    _client = client;
    cb(null, client);
  })

}

const findOrCreateUserByName = (name, cb) => {
  connect( (err, client) => {
    if(err) return cb(err);
    let qry = 'select id from users where name = $1';
    client.query(qry, [name], (err, result) => {
      if(result.rows.length > 1){
        return cb(null, result.rows[0].id);
      }
      qry = 'insert into users(name) value($1) returning id';
      client.query(qry,[name],(err, result) => {
        if(err) return cb(err);
        cb(null, result.rows[0].id)
      })
    })
  })
}

const getTweetsByUser = (user, cb) => {
  var qry = `select content from tweets, users where tweets.user_id =
  users.id and users.name = $1`;
  connect( (err, client) => {
    if(err) return cb(err);
    client.query(qry,[user], (err, tweets)=>{
      if(err) return cb(err);
      cb(null, tweets.rows[0]);
    })
  })
}

const getAllTweets = (cb) => {
  connect( (err, client) => {
    if(err) return cb(err);
    let qry = `SELECT content FROM tweets`
    client.query(qry, (err, tweets) => {
      if(err) return cb(err);
      console.log(tweets.rows)
      cb(null, tweets.rows);
    })

  })
}

const sync = (cb) => {
  seedfile( (err, datafile) => {
    if(err) return cb(err);
      connect((err, client) => {
        if(err) return cb(err);

        let qry = `
          DROP TABLE IF EXISTS tweets;
          DROP TABLE IF EXISTS users;
          CREATE TABLE users (
            id SERIAL primary key,
            name TEXT DEFAULT NULL,
            picture_url TEXT
          );
          CREATE TABLE tweets (
            id SERIAL primary key,
            content TEXT DEFAULT NULL,
            user_id INTEGER REFERENCES users(id) NOT NULL
          );
        `;

        client.query(qry, (err) => {
          if(err) return cb(err);

          const qrys = datafile.split(';');
          qrys.forEach( query => {
            client.query(query, (err) => {
              if(err) return cb(err);
            })
          })

        })
      })
  })
}

module.exports = {
  sync,
  findOrCreateUserByName,
  getTweetsByUser,
  getAllTweets
}
