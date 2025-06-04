const reportsController = require('../v2controllers/reportsController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/v2/saledCategory', reportsController.getFilteredSaledCategory);
  app.post('/api/v2/reports/productTransactions', reportsController.getProductTransactions);
  app.post('/api/v2/reports/partyTransactions', reportsController.getPartyTransactions);
  app.post('/api/v2/reports/generalLedger', reportsController.getGeneralLedger);

  app.post('/api/v2/reports/gstr1', reportsController.getGSTR1);
  app.post('/api/v2/reports/gstr2', reportsController.getGSTR2);

  app.get('/api/v2/download/gstr1/excel', reportsController.downloadGSTR1Excel);
  app.get('/api/v2/download/gstr2/excel', reportsController.downloadGSTR2Excel);
};
