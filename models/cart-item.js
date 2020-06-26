const Sequelize = require('sequelize');

const db = require('../util/database');

const CartItem = db.define('cartItems', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
  },
});

module.exports = CartItem;
