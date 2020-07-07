const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// underscore means it is used only internally here
let _db;

// we create connection once, and then by getDb method we can interact with db
const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://breiter:qweqwe123123@nodejscourse.o73ks.mongodb.net/shop?retryWrites=true&w=majority'
  )
    .then((client) => {
      console.log('MongoDB is connected!');
      // can specify database name as an argument
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
