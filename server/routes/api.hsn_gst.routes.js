const controller = require('../controllers/api.hsn_gst.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/search-hsn-gst', controller.getHsnSuggestion);
};
