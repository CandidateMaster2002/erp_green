const customerController = require('../v2controllers/customerController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/v2/org/:orgId/customers', customerController.getCustomerByOrgId);
};
