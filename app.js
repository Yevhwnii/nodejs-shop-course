const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5f05eadf0d26d52b6cde0aee')
    .then((user) => {
      // In request we store mongoose model so we can call all the methods on it
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// Way of enabling mongoose
mongoose
  .connect(
    'mongodb+srv://breiter:qweqwe123123@nodejscourse.o73ks.mongodb.net/shop?retryWrites=true&w=majority'
  )
  .then((result) => {
    // Create user only if it is not exists
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: 'Breiter',
          email: 'test@test.com',
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    console.log('MongoDB is connected!');
    app.listen(3000);
    console.log('Server is running on 3000 port');
  })
  .catch((err) => console.log(err));
