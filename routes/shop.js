const path = require('path');

const express = require('express');

const rootDir = require('../../Module_3_DynamicContent/util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log(adminData.products);

  res.render('shop'); // we don`t need to define path to views folder since we did it globally in app.js
});

module.exports = router;
