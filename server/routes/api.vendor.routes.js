const controller = require('../controllers/api.vendors.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/vendor', controller.createVendor);
  app.post('/api/vendor/:id/update', controller.updateVendor);
  app.get('/api/vendor/:id', controller.deleteVendor);
  app.get('/api/getvendor/:id', controller.getVendorById);
  app.get('/api/getvendorsbyorg', controller.getAllVendorsById);
  app.get('/api/getallvendors', controller.getAllVendors);
};
