const purchaseEntryService = require('../v2services/purchaseEntryService');

module.exports = {
  purchaseEntry: async (req, res) => {
    try {
      const data = req.body;
      const grnInvoiceNo = await purchaseEntryService.purchaseEntry(data);
      return res.json({
        success: true,
        message: 'Purchase entry created successfully',
        grnInvoiceNo,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to create purchase entry',
      });
    }
  },

  getTotalPurchaseAmount: async (req, res) => {
    try {
      const orgId = req.query.orgId;
      const results = await purchaseEntryService.getTotalPurchaseAmount(orgId);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get total purchase amount',
      });
    }
  },

  getTotalPurchaseEntries: async (req, res) => {
    try {
      const orgId = req.query.orgId;
      const results = await purchaseEntryService.getTotalPurchaseEntries(orgId);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get total purchase entries',
      });
    }
  },

  getFilteredPurchaseEntries: async (req, res) => {
    try {
      const filter = {
        month: req.query.month,
        year: req.query.year,
        quarter: req.query.quarter,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        orgId: req.query.orgId,
      };

      const results = await purchaseEntryService.getFilteredPurchaseEntries(filter);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to filter purchase entry',
      });
    }
  },
};
