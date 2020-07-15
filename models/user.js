const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    // Embedded document, which is array of productId of type objectId and quantity
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// Add item to the cart for current user
userSchema.methods.addToCart = function (product) {
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
      productId: product._id,
      quantity: newQuantity,
    });
  }

  // Updated cart
  const updatedCart = {
    items: updatedCartItems,
  };
  // Update the db and return promise
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (productId) {
  // Filter old array of item so it does not include item we want to delete
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  // Replace items in Schema
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
