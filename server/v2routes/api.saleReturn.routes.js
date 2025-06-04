const saleReturnController = require('../v2controllers/saleReturnController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/v2/saleReturns', saleReturnController.getFilteredSaleReturns);
};
