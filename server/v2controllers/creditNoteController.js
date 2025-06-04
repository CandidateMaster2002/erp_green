const creditNoteService = require('../v2services/creditNoteService');

module.exports = {
  creditNoteEntry: async (req, res) => {
    const data = req.body;
    try {
      const creditInvoiceNo = await creditNoteService.creditNoteEntry(data);
      res.status(201).json({
        success: true,
        creditInvoiceNo,
        message: 'Credit Note created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getFilteredCreditNotes: async (req, res) => {
    try {
      const filter = {
        month: req.query.month,
        year: req.query.year,
        quarter: req.query.quarter,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        orgId: req.query.orgId,
      };

      const results = await creditNoteService.getFilteredCreditNotes(filter);
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
