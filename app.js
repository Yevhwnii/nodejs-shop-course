const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// set global values on our app
app.set('view engine', 'pug'); // says express to use pug/whatever as a templating engine (should have built-in support for express)
app.set('views', 'views'); // says express where he can get templates

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(3000);
