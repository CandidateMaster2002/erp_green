const purchaseOrderController = require('../v2controllers/purchaseOrderController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/v2/purchaseOrder', purchaseOrderController.purchaseOrder);
  app.get('/api/v2/purchaseOrders', purchaseOrderController.getFilteredPurchaseOrders);
};
