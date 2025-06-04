const controller = require('../controllers/api.transaction.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/transaction/getbalance', controller.getBalance);
  app.post('/api/transaction/updatebalance', controller.updateBalance);
};
