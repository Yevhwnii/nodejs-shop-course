const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Defining schema/structure of the collection
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    // Name of user schema, here we specify to which field object id defined here relates
    ref: 'User',
    required: true,
  },
});

// Connect schema with the name in database
// Mongoose takes 'Product' in all lower case and adds plural form to it
module.exports = mongoose.model('Product', productSchema);
