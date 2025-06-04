const controller = require('../controllers/api.order.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/order/', controller.createOrder);
  app.patch('/order/', controller.updateOrder);
  app.delete('/order/', controller.deleteOrder);
  app.get('/order/:id', controller.getOrderById);
  app.get('/order/:id', controller.getAllOrdersById);
};
