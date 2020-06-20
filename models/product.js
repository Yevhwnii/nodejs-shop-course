const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../', 'data', 'products.json');
// Explanation 1
const getProductsFromFile = (callback) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return callback([]);
    }
    callback(JSON.parse(fileContent));
  });
};

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAllProducts(callback) {
    getProductsFromFile(callback);
  }
};

/*
Explanation 1: Since readFile is a async function, it means then when we simply call 
fetch all products in controller we get undefined because readFile is not finished yet.
To fix this, we pass into this function a callback function. This callback function is executed
when file is read already and passes products as an argument in it. That is why in controller,
it firstly wait until reading of a file is finished and only then renders a page of products.

Argument "products" in product controller is an array of products we pass here in callback function.
*/
