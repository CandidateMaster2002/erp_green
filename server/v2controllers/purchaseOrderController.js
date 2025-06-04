const purchaseOrderService = require('../v2services/purchaseOrderService');

module.exports = {
  purchaseOrder: async (req, res) => {
    try {
      const data = req.body;
      const purchaseOrderNo = await purchaseOrderService.createPurchaseOrder(data);
      return res.status(200).json({
        success: true,
        message: 'Purchase order created successfully',
        purchaseOrderNo,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to create purchase order',
      });
    }
  },

  getFilteredPurchaseOrders: async (req, res) => {
    try {
      const filter = {
        month: req.query.month,
        year: req.query.year,
        quarter: req.query.quarter,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        orgId: req.query.orgId,
      };

      const results = await purchaseOrderService.getFilteredPurchaseOrders(filter);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to filter purchase order',
      });
    }
  },
};
