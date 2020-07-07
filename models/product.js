const getDb = require('../util/database').getDb;

// Way of creating models through vanila MongoDb connection
class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    // Telling which collection to use
    return (
      db
        .collection('products') // we return here to make it possible to chain then block
        // that will make this method return a promise.
        .insertOne(this)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => console.log(err))
    );
  }
}

module.exports = Product;
