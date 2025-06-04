const creditNoteController = require('../v2controllers/creditNoteController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });
  app.post('/api/v2/creditNoteEntry', creditNoteController.creditNoteEntry);
  app.get('/api/v2/creditNotes', creditNoteController.getFilteredCreditNotes);
};
