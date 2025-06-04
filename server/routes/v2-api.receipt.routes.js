const {
  getSalesReceipt, getSalesReceiptPDF,
  getReturnReceipt, getReturnReceiptPDF,
  getGrnReceipt,
  getGrnReceiptPDF,
  getPoReceipt,
  getPoReceiptPDF,
  getCreditNoteReceipt,
  getCreditNoteReceiptPDF,
  getDebitNoteReceipt,
  getDebitNoteReceiptPDF,
} = require('../controllers/v2-api.receipt.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/v2/salesReceipt/:id', getSalesReceipt);
  app.get('/api/v2/salesReceipt/:id/pdf', getSalesReceiptPDF);

  app.get('/api/v2/returnReceipt/:id', getReturnReceipt);
  app.get('/api/v2/returnReceipt/:id/pdf', getReturnReceiptPDF);

  app.get('/api/v2/grnReceipt/:id', getGrnReceipt);
  app.get('/api/v2/grnReceipt/:id/pdf', getGrnReceiptPDF);

  app.get('/api/v2/poReceipt/:id', getPoReceipt);
  app.get('/api/v2/poReceipt/:id/pdf', getPoReceiptPDF);

  app.get('/api/v2/creditNoteReceipt/:id', getCreditNoteReceipt);
  app.get('/api/v2/creditNoteReceipt/:id/pdf', getCreditNoteReceiptPDF);

  app.get('/api/v2/debitNoteReceipt/:id', getDebitNoteReceipt);
  app.get('/api/v2/debitNoteReceipt/:id/pdf', getDebitNoteReceiptPDF);
};
