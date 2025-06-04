const barcodeService = require('../v2services/barcodeService');

module.exports = {
  generateBarcode: async (req, res) => {
    const batchId = req.params.batchId;
    const orgId = req.query.orgId;
    try {
      const barcode = await barcodeService.generateBarcode(batchId, orgId);
      res.status(200).json({
        success: true,
        barcode,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  generateBarcodeFrame: async (req, res) => {
    const batchId = req.params.batchId;
    const orgId = req.query.orgId;
    try {
      const barcodeBuffer = await barcodeService.generateBarcodeFrame(batchId, orgId);
      console.log(barcodeBuffer);

      // Set the appropriate headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="barcode.png"');

      // Send the buffer as the response
      res.status(200).send(barcodeBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
