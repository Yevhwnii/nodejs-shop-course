// const mysql = require('mysql2');

// // Pool will manage for us creating and closing connection on even multiple queries
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'nodejs_course',
//   password: 'ichigo32',
// }); // creating a pool so we don`t have to open and close connection for each query

// module.exports = pool.promise(); // allows us to use promises (async code)

////////////////////////////////////////////////////

const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs_course', 'root', 'ichigo32', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
