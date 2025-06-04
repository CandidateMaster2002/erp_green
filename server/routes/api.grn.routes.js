// const { getPool } = require('../config/database');
// const {authMiddleware} = require('../middlewares');
const controller = require('../controllers/api.grn.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/creategrn', controller.createGRN);
  app.post('/api/creategrncarts', controller.createGRNcarts);

  app.get('/api/searchdatesgrn/', controller.searchDates);
  app.get('/api/searchmonthgrn/', controller.searchMonth);
  app.get('/api/searchquartergrn/', controller.searchQuarter);
  app.get('/api/searchyeargrn/', controller.searchYear);

  app.get('/api/gettotalpurchasebills', controller.getTotalPurchaseBills);

  app.get('/api/getgrnreceipts/:id', controller.getGRNreceipt);

  app.get('/api/cancelGrn', controller.cancelGRN);
};
