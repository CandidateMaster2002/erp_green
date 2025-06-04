const controller = require('../controllers/api.debit.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });
  app.get('/api/getinvdetailsindebitnote', controller.getINVDetailsinDebitNote);
  app.get('/api/getdebitnoteininvoice', controller.getDebitNoteInInvoice);

  app.post('/api/createdebitnote', controller.createDebitNote);
  app.post('/api/debitnotecartdetails/', controller.createDebitNoteCarts);

  app.get('/api/searchdatesdebit/', controller.searchDates);
  app.get('/api/searchmonthdebit/', controller.searchMonth);
  app.get('/api/searchquarterdebit/', controller.searchQuarter);
  app.get('/api/searchyeardebit/', controller.searchYear);

  app.get('/api/cancelDebitNote', controller.cancelDebitNote);
};
