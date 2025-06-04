const { createReturnCartItem, getReturnCartItems } = require('../controllers/api.returncartitem.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/returncartitem/', createReturnCartItem);
  app.get('/api/getreturncartitems/', getReturnCartItems);
};
