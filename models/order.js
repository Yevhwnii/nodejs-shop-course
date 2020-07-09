const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  // If array of documents, you define them as object
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
});

module.exports = mongoose.model('Order', orderSchema);
