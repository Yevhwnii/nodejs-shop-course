const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://breiter:qweqwe123123@nodejscourse.o73ks.mongodb.net/<dbname>?retryWrites=true&w=majority'
  )
    .then((client) => {
      console.log('MongoDB is connected!');
      callback(client);
    })
    .catch((err) => console.log(err));
};

module.exports = mongoConnect;
