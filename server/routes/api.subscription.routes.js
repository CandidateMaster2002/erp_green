const controller = require('../controllers/api.subscription.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/subscription/currentplan/:id', controller.getCurrentPlanDetails);
  app.post('/api/subscription/subscribe', controller.subscribeToPlan);
  app.get('/api/subscription/plans', controller.fetchAllPlans);
  app.get('/api/subscription/billinghistory/:id', controller.getBillingHistory);
};
