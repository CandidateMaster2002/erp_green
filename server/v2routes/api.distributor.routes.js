const distributorController = require('../v2controllers/distributorController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/v2/distributor', distributorController.createDistributor);
  app.post('/api/v2/distributor/:id/update', distributorController.updateDistributor);
  app.delete('/api/v2/distributor/:id', distributorController.deleteDistributor);
  app.get('/api/v2/distributor/:id', distributorController.getDistributorById);
  app.get('/api/v2/get-all-distributor', distributorController.getAllDistributorsById);
};
