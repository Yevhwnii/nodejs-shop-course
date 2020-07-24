// dotenv config
require('dotenv').config();
// 3-rd party imports
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
// Local imports
const errorController = require('./controllers/error');
const User = require('./models/user');
// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
// Constants
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
});
const csrfProtection = csrf();
// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Storage for multer
const fileStorage = multer.diskStorage({
  // Each of these keys receive 3 arguments
  // and we should call callback function to let multer go thru
  // First argument is error and if it is null multer goes ahead
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Math.random() + '-' + file.originalname);
  },
});

// File filter for multer
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Package middlewares
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SECRET_KEY,
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

// Assigning local variables to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Extracting user from database, and assigning its data to every request
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // Check to be sure we are not storing undefined user in session object
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // If some technical issue occured like Mongo servers are down
      next(new Error(err));
    });
});

// Enabling routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

// Global error handler
// if next() is called with Error object, this middleware is executed, skipping all previous ones
app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error occured',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
});

// Enabling mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    console.log('MongoDB is connected!');
    app.listen(3000);
    console.log('Server is running on 3000 port');
  })
  .catch((err) => console.log(err));
