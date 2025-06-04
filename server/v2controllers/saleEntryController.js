const saleEntryService = require('../v2services/saleEntryService');

module.exports = {
  saleEntry: async (req, res) => {
    const data = req.body;
    try {
      const orderId = await saleEntryService.saleEntry(data);
      res.status(201).json({
        success: true,
        orderId,
        message: 'Sale Entry created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getTotalSaleAmount: async (req, res) => {
    try {
      const orgId = req.query.orgId;
      const results = await saleEntryService.getTotalSaleAmount(orgId);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get total Sale amount',
      });
    }
  },

  getTotalSaleEntries: async (req, res) => {
    try {
      const orgId = req.query.orgId;
      const results = await saleEntryService.getTotalSaleEntries(orgId);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get total Sale entries',
      });
    }
  },

  getFilteredSaleEntries: async (req, res) => {
    try {
      const filter = {
        month: req.query.month,
        year: req.query.year,
        quarter: req.query.quarter,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        orgId: req.query.orgId,
      };

      const results = await saleEntryService.getFilteredSaleEntries(filter);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to filter sale entry',
      });
    }
  },
};
