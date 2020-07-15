const bcrypt = require('bcryptjs');

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
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            // User entered valid password
            req.session.isLoggedIn = true;
            req.session.user = user;
            // To be sure session was created
            return req.session.save(() => {
              res.redirect('/');
            });
          }
          res.redirect('/login');
        })
        .catch((err) => {
          res.redirect('/login');
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

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      // Second argument is salt - number of hash rounds, more rounds - more secure but take more time
      // This action is not inversible, you cannot deencrypt it.
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
        });
    })

    .catch((err) => console.log(err));
};
