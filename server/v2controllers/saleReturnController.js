const saleReturnService = require('../v2services/saleReturnService');

module.exports = {
  getFilteredSaleReturns: async (req, res) => {
    try {
      const filter = {
        month: req.query.month,
        year: req.query.year,
        quarter: req.query.quarter,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        orgId: req.query.orgId,
      };

      const results = await saleReturnService.getFilteredSaleReturns(filter);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to filter sale return',
      });
    }
  },
};
