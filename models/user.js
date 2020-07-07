const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    // Loop through cart and find if that product exists
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      // Since product is just returned from db, it is not of type string
      return cp.productId.toString() === product._id.toString();
    });
    // Default qunatity
    let newQuantity = 1;
    // Copy old array
    const updatedCartItems = [...this.cart.items];
    // If index is greater than -1
    if (cartProductIndex >= 0) {
      // Add to existing quanitity +1
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      // Update quantity
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      // Here we store reference to product so that if we change price for it,
      // it is changed in whole application

      // Else add new product to cart items
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    // Updated cart
    const updatedCart = {
      items: updatedCartItems,
    };
    // Get db
    const db = getDb();
    // Update the db and return promise
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    // Reach to db
    const db = getDb();
    // Extract all ids from this.cart.items array and assign them to single array
    const productIds = this.cart.items.map((item) => {
      // For each item get its id and add to array then return this array
      return item.productId;
    });

    // Look up in database all the products which in productIds array
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        // Loop for every product we got from db
        return products.map((product) => {
          return {
            // populate with product data
            ...product,
            // populate with quantity
            quantity: this.cart.items.find((item) => {
              // return true if current item from cart is equal to product from db
              return item.productId.toString() === product._id.toString();
              // after product found, extract its quantity from cart
            }).quantity,
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    // Filter old array of item so it does not include item we want to delete
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    // Reach to db
    const db = getDb();
    // Overwrite existing user`s cart with new items
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    // Reach to db
    const db = getDb();
    // Get product data information
    return this.getCart()
      .then((products) => {
        const order = {
          // Assign products we got from getCart call and add some fields
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };
        return (
          db
            .collection('orders')
            // Insert new order with existing cart
            .insertOne(order)
        );
      })
      .then((result) => {
        // Clean the cart
        this.cart = { items: [] };
        // Clean the cart in db
        return db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    const db = getDb();

    return db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    // React db
    const db = getDb();

    // Return user where _id is equal to converted userId from argument
    return db
      .collection('users')
      .find({ _id: new ObjectId(userId) })
      .next()
      .then((user) => {
        return user;
      });
  }
}

/*
When you delete product, item from carts of users are not deleted,
this may be fixed in two ways either implementing worker which will do cleanup work
every 24h f.e. or manually check for these items and delete them when user for example
opens a cart.

*/

module.exports = User;
