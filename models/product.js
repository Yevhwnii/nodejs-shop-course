const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

// Way of creating models through vanila MongoDb connection
class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    let dbOperation;
    if (this._id) {
      // Update product
      dbOperation = db.collection('products').updateOne(
        {
          _id: this._id,
        },
        { $set: this }
      );
    } else {
      dbOperation = db.collection('products').insertOne(this); // we return here to make it possible to chain then block
      // that will make this method return a promise.
    }
    // Telling which collection to use
    return dbOperation.then((result) => {}).catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    // returns cursor first. calling to array, returns all documents in array
    // should only be used when amount of doucments is not that big, otherwise use pagination
    return db
      .collection('products')
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    // simple comparison of prodId to _id wont work because _id is special type stored in BSON format
    // so we have to convert it first and only then compare
    const db = getDb();
    // next return next document found by criteria
    return db
      .collection('products')
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then((result) => {})
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
