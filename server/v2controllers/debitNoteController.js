/* eslint-disable max-len */
const debitNoteService = require('../v2services/debitNoteService');

module.exports = {
  debitNoteEntry: async (req, res) => {
    const data = req.body;
    try {
      const debitInvoiceNo = await debitNoteService.debitNoteEntry(data);
      res.status(201).json({
        success: true,
        debitInvoiceNo,
        message: 'Debit Note created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getFilteredDebitNotes: async (req, res) => {
    try {
      const filter = {
        month: req.query.month,
        year: req.query.year,
        quarter: req.query.quarter,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        orgId: req.query.orgId,
      };

      const results = await debitNoteService.getFilteredDebitNotes(filter);
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
