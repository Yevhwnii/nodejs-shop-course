const Sequelize = require('sequelize');

const db = require('../util/database');

const Cart = db.define('carts', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Cart;

// A cart should belong to one user but should also hold many products.
// That is why, cart tables should hold different cart for different users

// While cart should hold cart items which contains products
