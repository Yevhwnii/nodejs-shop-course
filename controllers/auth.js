const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  // Here we set up a cookie
  // Cookie is by default sent to the server by browser with every request
  // It has past time by default and will expire when browser will close
  // But user will be able to manipulate data from browser,
  // which means sensative data should be stored in the browser
  // Cookie is a good thing to store data across requests
  // They can be configured, they have some reserved words like HttpOnly, Secure, Domain, Max-age, Expires
  // res.setHeader('Set-Cookie', 'loggedIn=true');

  // Session middleware sets up a cookie which can be then manipulated
  // and which identifies browser
  // Data in session is stored across one instance of browser, so that
  // even the same user will not be logged in by default when he enters same page from another browser
  User.findById('5f05eadf0d26d52b6cde0aee')
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // To be sure session was created
      req.session.save(() => {
        res.redirect('/');
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // Here is way how session gets deleted from database
  // so after sometime cookie will not do anything
  req.session.destroy((err) => {
    res.redirect('/');
  });
};

exports.getSignUp = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
  });
};

exports.postSignUp = (req, res, next) => {};
