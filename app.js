const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5f0491e4fe2f3514332f64a4')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id); // adding new field to request which means when req comes here, it assign user to it and passes to other middlewares which then can user it
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Here we create connection to database, and then in the rest of app we have access to it through getDb method
mongoConnect(() => {
  app.listen(3000);
});
