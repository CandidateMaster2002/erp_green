const controller = require('../controllers/api.product.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/createproduct', controller.createProduct);
  app.post('/api/updateproduct/:id', controller.updateProduct);
  app.get('/product/:id', controller.deleteProduct);
  app.get('/product/', controller.getAllProducts);
  app.get('/api/product/:id', controller.getProductById);
};
