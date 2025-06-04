const {
  createReturnOrder, searchDates, searchMonth, searchQuarter, searchYear, getReturnDetails,
  cancelReturnInvoice,
} = require('../controllers/api.returndetails.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });
  app.post('/api/return/', createReturnOrder);
  app.get('/api/searchdatesreturn/', searchDates);
  app.get('/api/searchmonthreturn/', searchMonth);
  app.get('/api/searchquarterreturn/', searchQuarter);
  app.get('/api/searchyearreturn/', searchYear);

  app.get('/api/getreturndetails', getReturnDetails);

  app.get('/api/cancelReturnInvoice', cancelReturnInvoice);
};
