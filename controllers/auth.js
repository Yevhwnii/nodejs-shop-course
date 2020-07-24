const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator/check');

require('dotenv').config();

const User = require('../models/user');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ACCOUNT_NAME,
    pass: process.env.ACCOUNT_PASSWORD,
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email,
            password,
          },
          validationErrors: [],
        });
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email,
              password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          res.redirect('/login');
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  // Here is way how session gets deleted from database
  // so after sometime cookie will not do anything
  req.session.destroy((err) => {
    res.redirect('/');
  });
};

exports.getSignUp = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // In auth routes, we added middleware which checks field 'email' is it email and store
  // result in req body. Then, validationResult is used on req body and extracts errors if there are
  const errors = validationResult(req);

  // If errors array is not empty
  if (!errors.isEmpty()) {
    // Error status code which indicates that validation failed
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  // Second argument is salt - number of hash rounds, more rounds - more secure but take more time
  // This action is not inversible, you cannot deencrypt it.
  bcrypt
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
      const mailOptions = {
        from: `Best shop in da world! <${process.env.ACCOUNT_NAME}>`,
        to: email,
        subject: 'You have succesfully signed up!',
        html:
          '<h1> Welcome to our shop!</h1> <br/> <h2> You have succeed in creating an account! </h2>',
      };

      transporter.sendMail(mailOptions);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with such email found');
          return res.redirect('/reset');
        }
        // Assign token to the user instance
        user.resetToken = token;
        // Date now + 1 hour
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        const mailOptions = {
          from: `Best shop in da world! <${process.env.ACCOUNT_NAME}>`,
          to: req.body.email,
          subject: 'Reset your password',
          html: `
            <p> You requested password reset </p>
            <p> Click this <a href="http://localhost:3000/reset/${token}"> link </a> to set a new password </p>
            `,
        };
        transporter.sendMail(mailOptions);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  // If there is a token and token date is greater than now
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let targetedUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      targetedUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      targetedUser.password = hashedPassword;
      targetedUser.resetToken = undefined;
      targetedUser.resetTokenExpiration = undefined;
      targetedUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
