const csvUploadService = require('../v2services/csvUploadService');

module.exports = {
  csvUpload: async (req, res) => {
    const file = req.file;
    const filePath = file.path;
    try {
      const results = await csvUploadService.parseCSV(filePath);
      req.session.parsedCSVData = results;

      res.status(200).json({
        success: true,
        message: 'File uploaded and parsed successfully',
        data: {
          parsedCSVData: results,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing file',
        error: error.message,
      });
    }
  },

  displayInventoryColumns: async (req, res) => {
    const parsedCSVData = req.session.parsedCSVData;
    try {
      if (!parsedCSVData) {
        throw new Error('No parsed data found');
      }
      const csvColumns = Object.keys(parsedCSVData[0]);
      const systemColumns = ['ProductName', 'BatchName', 'ExpiryDate', 'Quantity', 'HSN', 'GST', 'MRP', 'PTR', 'Conversion', 'PriUnit', 'SecUnit'];
      res.status(200).json({
        success: true,
        message: 'Column mapping displayed successfully',
        data: {
          csvColumns,
          systemColumns,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error displaying columns for mapping',
        error: error.message,
      });
    }
  },

  displayPurchaseBillColumns: async (req, res) => {
    const parsedCSVData = req.session.parsedCSVData;
    try {
      if (!parsedCSVData) {
        throw new Error('No parsed data found');
      }
      const csvColumns = Object.keys(parsedCSVData[0]);
      const systemColumns = ['ProductName', 'BatchName', 'ExpiryDate', 'Quantity', 'Free', 'HSN', 'GST', 'MRP', 'PTR', 'DiscountPct', 'Conversion', 'PriUnit', 'SecUnit'];
      res.status(200).json({
        success: true,
        message: 'Column mapping displayed successfully',
        data: {
          csvColumns,
          systemColumns,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error displaying columns for mapping',
        error: error.message,
      });
    }
  },

  mapInventoryColumns: async (req, res) => {
    const parsedCSVData = req.session.parsedCSVData;
    const { columnMapping } = req.body;

    try {
      if (!parsedCSVData) {
        throw new Error('No parsed data found');
      }
      if (!columnMapping) {
        throw new Error('No mapping found');
      }
      // eslint-disable-next-line max-len
      const mappedData = await csvUploadService.processInventoryCSVData(parsedCSVData, columnMapping);
      req.session.mappedData = mappedData;
      res.status(200).json({
        success: true,
        message: 'Columns mapped successfully',
        data: { mappedData },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error while mapping columns',
        error: error.message,
      });
    }
  },

  mapPurchaseBillColumns: async (req, res) => {
    const parsedCSVData = req.session.parsedCSVData;
    const { purchaseBillColumnMapping } = req.body;

    try {
      if (!parsedCSVData) {
        throw new Error('No parsed data found');
      }
      if (!purchaseBillColumnMapping) {
        throw new Error('No mapping found');
      }
      // eslint-disable-next-line max-len
      const mappedData = await csvUploadService.processPurchaseBillCSVData(parsedCSVData, purchaseBillColumnMapping);
      req.session.mappedData = mappedData;
      res.status(200).json({
        success: true,
        message: 'Columns mapped successfully',
        data: { mappedData },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error while mapping columns',
        error: error.message,
      });
    }
  },

  uploadInventory: async (req, res) => {
    const { mappedProducts } = req.body;
    const orgId = req.query.orgId;
    try {
      await csvUploadService.uploadInventory(mappedProducts, orgId);
      res.status(200).json({
        success: true,
        message: 'Inventory uploaded successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading inventory',
        error: error.message,
      });
    }
  },

  uploadPurchaseBill: async (req, res) => {
    const data = req.body;
    const orgId = req.query.orgId;
    try {
      const grnInvoiceNo = await csvUploadService.uploadPurchaseBill(data, orgId);
      res.status(200).json({
        success: true,
        message: 'Purchase bill uploaded successfully',
        data: grnInvoiceNo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading purchase bill',
        error: error.message,
      });
    }
  },

  // Cleanup session data on new upload
  cleanupSessionData: (req, res, next) => {
    req.session.parsedCSVData = null;
    req.session.mappedData = null;
    next();
  },
};
