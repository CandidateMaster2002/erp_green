const purchaseEntryController = require('../v2controllers/purchaseEntryController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/v2/purchaseEntry', purchaseEntryController.purchaseEntry);
  app.get('/api/v2/purchaseEntries', purchaseEntryController.getFilteredPurchaseEntries);

  app.get('/api/v2/purchaseEntry/total', purchaseEntryController.getTotalPurchaseAmount);
  app.get('/api/v2/purchaseEntry/totalEntries', purchaseEntryController.getTotalPurchaseEntries);
};
