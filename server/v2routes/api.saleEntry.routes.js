const saleEntryController = require('../v2controllers/saleEntryController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/v2/saleEntry', saleEntryController.saleEntry);
  app.get('/api/v2/saleEntries', saleEntryController.getFilteredSaleEntries);

  app.get('/api/v2/saleEntry/total', saleEntryController.getTotalSaleAmount);
  app.get('/api/v2/saleEntry/totalEntries', saleEntryController.getTotalSaleEntries);
};
