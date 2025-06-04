const controller = require('../controllers/api.inventory.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/createinventory/', controller.createInventory);
  app.get('/api/getallinventory', controller.getAllInventory);

  app.post('/api/updateinventory/:id', controller.updateInventory);
  app.get('/api/deleteinventory/:id', controller.deleteInventory);
  app.get('/api/getinventory', controller.getInventoryById);
  app.get('/inventory/:id', controller.getAllInventorysById);

  app.get('/api/checkbyid', controller.checkById);

  app.get('/api/nextThreeMonthExp/:id', controller.next3MonthsExpiry);
  app.get('/api/lastThreeMonthExp/:id', controller.last3MonthsExpiry);
  app.get('/api/thisMonthExp/:id', controller.thisMonthExpiry);

  // Temporary API for testing email sending
  app.get('/api/email', controller.createAllNearExpiryReports);
};
