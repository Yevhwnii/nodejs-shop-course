// 3-rd party imports
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
// Local imports
const errorController = require('./controllers/error');
const User = require('./models/user');
// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
// Constants
const MONGODB_URI =
  'mongodb+srv://breiter:qweqwe123123@nodejscourse.o73ks.mongodb.net/shop';
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
const csrfProtection = csrf();
// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Package middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'veryveryverylongstringvalue',
    resave: false, // save session only if something changed
    saveUninitialized: false, // no session is saved for request where it doesnt need to be saved
    cookie: {},
    store: store,
  })
);

// For any non-GET request this package will look for the existance of csrf token
// in request body.
// We pass this token to the views, and from there, we add to all forms, input with name _csrf and value of this token
// it will be checked behind the scenes and compared.
// This middleware assigns csrf variable to request and pass it forward
app.use(csrfProtection);

// Flash messages
// Allows us to add flash messages in session object as key value pair
// and afterwards use them, and instantly remove from session object so we don`t have it stored
// forever (auth.js)
app.use(flash());

// Extracting user from database, and assigning its data to every request
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// Assigning local variables to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Enabling routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// Enabling mongoose
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log('MongoDB is connected!');
    app.listen(3000);
    console.log('Server is running on 3000 port');
  })
  .catch((err) => console.log(err));
