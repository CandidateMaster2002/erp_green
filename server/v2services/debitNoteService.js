/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const debitNoteModel = require('../v2models/debitNoteModel');
const debitNoteItemModel = require('../v2models/debitNoteItemModel');
const batchModel = require('../v2models/batchModel');
const organisationModel = require('../v2models/organisationModel');
const distributorService = require('./distributorService');

module.exports = {
  debitNoteEntry: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const returnDate = day + month + year;

      // Generate debit invoice number
      const pharmacyId = await organisationModel.getPharmacyId(connection, data.orgId);
      const totalResults = await debitNoteModel.getDebitNoteCount(connection, month, year, data.orgId);
      const debitInvoiceNo = `${pharmacyId[0].org_id_main}DB${returnDate}${totalResults[0].total_rows + 1}`;

      // Create debit note items and update batch
      const debitNoteItems = data.debitNoteItems;

      // Determine GST type based on vendor's GSTIN and organization's GSTIN
      const gstType = await distributorService.getGSTType(data.vendorId, data.orgId);

      // Variables to store aggregate totals
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      const lessDiscountPercent = (parseFloat(data.lessDiscount) / parseFloat(data.debitAmt)) * 100;

      // First loop for calculating GST
      debitNoteItems.forEach((item) => {
        // Calculate item totals
        const itemTotal = ((item.debitPriQty * item.ptr) + ((item.ptr / item.conversion) * item.debitSecQty)) * (1 - (lessDiscountPercent / 100));

        let itemCgst = 0;
        let itemSgst = 0;
        let itemIgst = 0;

        if (gstType === 'intra') {
          itemCgst = itemTotal * (item.gst / 2 / 100);
          itemSgst = itemTotal * (item.gst / 2 / 100);
          totalCgst += itemCgst;
          totalSgst += itemSgst;
        } else if (gstType === 'inter') {
          itemIgst = itemTotal * (item.gst / 100);
          totalIgst += itemIgst;
        }

        // Store item-level GST values (**currently we are not storing these item-level gst values in the database-06/06/24**)
        item.cgst = itemCgst;
        item.sgst = itemSgst;
        item.igst = itemIgst;
      });

      const totalCgstRounded = totalCgst.toFixed(2);
      const totalSgstRounded = totalSgst.toFixed(2);
      const totalIgstRounded = totalIgst.toFixed(2);

      // Create debit note items and update batch
      const debitNoteData = {
        vendorId: data.vendorId,
        orgId: data.orgId,
        debitAmt: parseFloat(data.debitAmt),
        lessDiscount: parseFloat(data.lessDiscount),
        totalCgst: parseFloat(totalCgstRounded),
        totalSgst: parseFloat(totalSgstRounded),
        totalIgst: parseFloat(totalIgstRounded),
      };

      // Create debit note
      await debitNoteModel.createDebitNote(connection, debitNoteData, debitInvoiceNo);

      await Promise.all(
        debitNoteItems.map(async (item) => {
          debitNoteItemModel.createDebitNoteItem(connection, item, debitInvoiceNo);
          batchModel.updateBatchAfterDebitEntry(connection, item);
        }),
      );

      return debitInvoiceNo;
    });
  },

  getFilteredDebitNotes: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return debitNoteModel.getDebitNotesBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
      }

      if (filter.quarter && filter.year) {
        let quarterStart;
        let quarterEnd;
        if (filter.quarter === '1') {
          quarterStart = 4;
          quarterEnd = 6;
        } else if (filter.quarter === '2') {
          quarterStart = 7;
          quarterEnd = 9;
        } else if (filter.quarter === '3') {
          quarterStart = 10;
          quarterEnd = 12;
        } else if (filter.quarter === '4') {
          quarterStart = 1;
          quarterEnd = 3;
        }
        // eslint-disable-next-line max-len
        return debitNoteModel.getDebitNoteForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return debitNoteModel.getDebitNoteForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return debitNoteModel.getDebitNoteForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });
  },

};
