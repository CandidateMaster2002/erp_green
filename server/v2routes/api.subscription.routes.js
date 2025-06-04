const subscriptionController = require('../v2controllers/subscriptionController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/v2/subscriptions/plans', subscriptionController.getAllPlans);
  app.get('/api/v2/subscriptions/plans/:planId', subscriptionController.getPlanById);
  app.post('/api/v2/subscriptions/create-order', subscriptionController.createRazorpayOrder);
  app.post('/api/v2/subscriptions/verify-payment', subscriptionController.verifyRazorpayPayment);
  app.get('/api/v2/subscriptions/bill/:billId', subscriptionController.getBillById);
  app.post('/api/v2/subscriptions/record-failure', subscriptionController.recordPaymentFailure);
  app.get('/api/v2/subscription/receipt/:billId', subscriptionController.getSubscriptionReceipt);
  app.get('/api/v2/subscription/receipt/:billId/pdf', subscriptionController.getSubscriptionReceiptPDF);
};
