const receiptController = require('../v2controllers/receiptController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/api/v2/salesReceipt/:id', receiptController.getSaleEntryReceipt);
  app.get('/api/v2/salesReceipt/:id/pdf', receiptController.getSaleEntryReceiptPDF);

  app.get('/api/v2/returnReceipt/:id', receiptController.getSaleReturnReceipt);
  app.get('/api/v2/returnReceipt/:id/pdf', receiptController.getSaleReturnReceiptPDF);

  app.get('/api/v2/grnReceipt/:id', receiptController.getPurchaseEntryReceipt);
  app.get('/api/v2/grnReceipt/:id/pdf', receiptController.getPurchaseEntryReceiptPDF);

  app.get('/api/v2/poReceipt/:id', receiptController.getPurchaseOrderReceipt);
  app.get('/api/v2/poReceipt/:id/pdf', receiptController.getPurchaseOrderReceiptPDF);

  app.get('/api/v2/creditNoteReceipt/:id', receiptController.getCreditNoteReceipt);
  app.get('/api/v2/creditNoteReceipt/:id/pdf', receiptController.getCreditNoteReceiptPDF);

  app.get('/api/v2/debitNoteReceipt/:id', receiptController.getDebitNoteReceipt);
  app.get('/api/v2/debitNoteReceipt/:id/pdf', receiptController.getDebitNoteReceiptPDF);
};
