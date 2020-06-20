const path = require('path');
const express = require('express');

const rootDir = require('../../Module_3_DynamicContent/util/path');

const router = express.Router();
const products = [];

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
  res.render('add-product', {
    // Passing additional data to the templating engine
    pageTitle: 'Add new product',
    path: '/admin/add-product',
  });
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect('/');
});

exports.routes = router;
exports.products = products;
