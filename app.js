const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const db = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user; // adding new field to request which means when req comes here, it assign user to it and passes to other middlewares which then can user it
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// ASSOCIATIONS
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' }); // user created many products
User.hasMany(Product); // reverse same relations as above

// Look at all the models, create tables based on them or relations
db.sync() // overwrite tables - force: true , argument
  .then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Breiter', email: 'test@test.com' });
    }
    return Promise.resolve(user);
  })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });

// Promises are callback which were used with file interaction but written in way more elegant way, btw
