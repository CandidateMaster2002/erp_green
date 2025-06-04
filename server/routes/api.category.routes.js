const { getAllCategory, getCategoryById } = require('../controllers/api.category.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/all-category/', getAllCategory);
  app.get('/api/category/:id', getCategoryById);
};
