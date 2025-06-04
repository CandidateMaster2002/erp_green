const controller = require('../controllers/api.financials.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  
  app.get('/api/grn_bills', controller.getAllProducts);
  app.post('/api/updategrnstatus', controller.updateStatus);
  
};