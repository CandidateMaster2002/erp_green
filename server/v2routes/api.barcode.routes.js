const barcodeController = require('../v2controllers/barcodeController');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });
  app.get('/api/v2/barcode/:batchId', barcodeController.generateBarcode);
  app.get('/api/v2/barcode/:batchId/frame', barcodeController.generateBarcodeFrame);
};
