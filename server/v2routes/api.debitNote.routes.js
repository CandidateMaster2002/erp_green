const debitNoteController = require('../v2controllers/debitNoteController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });
  app.post('/api/v2/debitNoteEntry', debitNoteController.debitNoteEntry);
  app.get('/api/v2/debitNotes', debitNoteController.getFilteredDebitNotes);
};
