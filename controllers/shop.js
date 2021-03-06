require('dotenv').config();

const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const { ppid } = require('process');
// const Cart = require('../models/cart');

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
  // if doest hold true value use 1 instead
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numberOfProducts) => {
      totalItems = numberOfProducts;
      return (
        Product.find()
          // Skip first x amount of results
          .skip((page - 1) * ITEMS_PER_PAGE)
          // Limits amount of data we fetched to particular number
          .limit(ITEMS_PER_PAGE)
      );
    })

    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  // Gives us all the products, not cursor (add .cursor to retreive cursor)
  // if doest hold true value use 1 instead
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numberOfProducts) => {
      totalItems = numberOfProducts;
      return (
        Product.find()
          // Skip first x amount of results
          .skip((page - 1) * ITEMS_PER_PAGE)
          // Limits amount of data we fetched to particular number
          .limit(ITEMS_PER_PAGE)
      );
    })

    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  // params object gives access to query params by express
  const prodId = req.params.productId;
  // Give us one product
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product: product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((userWithPopulatedCart) => {
      const products = userWithPopulatedCart.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'My cart',
        products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => res.redirect('/cart'));
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((userWithPopulatedCart) => {
      products = userWithPopulatedCart.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // Items required by stripe
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity,
          };
        }),
        // Redirect to this url once payment is successful
        success_url:
          req.protocol + '://' + req.get('host') + '/checkout/success',
        // Redirect if payment is failed
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then((session) => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'My Orders',
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((userWithPopulatedCart) => {
      products = userWithPopulatedCart.cart.items.map((i) => {
        // Access to the document itself, not mongoose object is thru _doc
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      const invoiceName = 'invoice-srakapauka' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      //   // Can control either to open file inline or download it
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      // Ensures that PDF get stored on the server
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      // pdfDoc is readable stream and res is writable stream that is why we can forward it there
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      });

      pdfDoc.text('------------------');
      let totalPrice = 0;
      order.products.forEach((product) => {
        totalPrice += product.quantity * product.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            product.product.title +
              ' - ' +
              product.quantity +
              ' x ' +
              '$' +
              product.product.price
          );
      });
      pdfDoc.fontSize(20).text('----');
      pdfDoc.text('Total price: $' + totalPrice);
      // Writable streams are closed, file is saved
      pdfDoc.end();

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   // Can control either to open file inline or download it
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);
      // // Response will be streamed to the browser
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
