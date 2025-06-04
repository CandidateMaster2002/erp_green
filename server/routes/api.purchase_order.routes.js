// const { getPool } = require('../config/database');
// const {authMiddleware} = require('../middlewares');

const controller = require('../controllers/api.purchase_order.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  // Owner routes
  app.post('/api/createpo/', controller.createPO);
  app.post('/api/createpocarts/', controller.createPOCarts);
  // app.patch('/api/owner/', controller.updateOwner);
  // app.delete('/api/owner/', controller.deleteOwner);

  app.get('/api/getpoininvoice', controller.getPOReceipt);

  app.get('/api/searchdatespo/', controller.searchDates);
  app.get('/api/searchmonthpo/', controller.searchMonth);
  app.get('/api/searchquarterpo/', controller.searchQuarter);
  app.get('/api/searchyearpo/', controller.searchYear);

  app.get('/api/cancelPurchaseOrder', controller.cancelPurchaseOrder);
};
