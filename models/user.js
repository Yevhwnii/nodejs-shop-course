// User should: be able to create a unique cart, hold there porducts, which means he has to relate to other tables
const Sequelize = require('sequelize');

const db = require('../util/database');

const User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
});

module.exports = User;
