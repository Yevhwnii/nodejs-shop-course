const fs = require('fs');
const path = require('path');

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    const p = path.join(__dirname, '../', 'data', 'products.json');
    fs.readFile(p, (error, fileContent) => {
      let products = [];
      if (!error) {
        products = JSON.parse(fileContent);
      }
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAllProducts() {
    const p = path.join(__dirname, '../', 'data', 'products.json');
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return [];
      }
      return JSON.parse(fileContent);
    });
  }
};
