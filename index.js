/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable camelcase */

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { initialisePool } = require('./server/config/database');
require('dotenv').config();
const { setCache } = require('./server/middlewares/cacheGobalProduct');
const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.use(express.static('public', { maxAge: 1000 * 60 * 60 * 24 * 365 }));
app.set('views', './server/views');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//     httpOnly: true, // Mitigate the risk of client side script accessing the protected cookie
//     maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie expiry set to 1 week
//   },
// }));

app.use(session({
  secret: process.env.SESSION_SECRET, //'dawaaiPassword', // use a secure key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(setCache);
// API Routes
require('./server/routes/api.org.routes')(app);
require('./server/routes/api.emp.routes')(app);
require('./server/routes/api.owner.routes')(app);
require('./server/routes/api.ref.routes')(app);
require('./server/routes/api.inventory.routes')(app);
require('./server/routes/api.product.routes')(app);
require('./server/routes/api.category.routes')(app);
require('./server/routes/api.vendor.routes')(app);
require('./server/routes/api.order.routes')(app);
require('./server/routes/api.customer.routes')(app);
require('./server/routes/api.auth.routes')(app);
require('./server/routes/api.salesdetail.routes')(app);
require('./server/routes/api.cartitem.routes')(app);
require('./server/routes/api.returndetails.routes')(app);
require('./server/routes/api.returncartitem.routes')(app);
require('./server/routes/api.batch.routes')(app);
require('./server/routes/api.purchase_order.routes')(app);
require('./server/routes/api.credit.routes')(app);
require('./server/routes/api.debit.routes')(app);
require('./server/routes/api.grn.routes')(app);
require('./server/routes/api.financials.routes')(app);
require('./server/routes/api.itemSearch.routes')(app);
require('./server/routes/api.whatsappMsg.route')(app);
require('./server/routes/api.hsn_gst.routes')(app);
require('./server/routes/api.transaction.routes')(app);
require('./server/routes/api.subscription.routes')(app);

// Version 2 API Routes
require('./server/v2routes/api.receipt.routes')(app);
require('./server/v2routes/api.inventory.routes')(app);
require('./server/v2routes/api.distributor.routes')(app);
require('./server/v2routes/api.debitNote.routes')(app);
require('./server/v2routes/api.creditNote.routes')(app);
require('./server/v2routes/api.purchaseEntry.routes')(app);
require('./server/v2routes/api.purchaseOrder.routes')(app);
require('./server/v2routes/api.customer.routes')(app);
require('./server/v2routes/api.saleEntry.routes')(app);
require('./server/v2routes/api.saleReturn.routes')(app);
require('./server/v2routes/api.subscription.routes')(app);
require('./server/v2routes/api.organisation.routes')(app);
require('./server/v2routes/api.reports.routes')(app);
require('./server/v2routes/api.csvUpload.routes')(app);
require('./server/v2routes/api.barcode.routes')(app);

// FRONT Routes
require('./server/routes/front.routes')(app);
require('./server/routes/front.auth.routes')(app);

// CRON Jobs
require('./server/cron-jobs/cron.notifications')();
require('./server/cron-jobs/cron.checkSubscription')();
require('./server/cron-jobs/cron.admin.registeredOrg')();

initialisePool().then(() => {
  app.listen(process.env.APP_PORT || 4800, () => {
    console.log('Server is live!');
  });
});
