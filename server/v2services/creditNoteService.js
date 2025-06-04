/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const batchModel = require('../v2models/batchModel');
const creditNoteItemModel = require('../v2models/creditNoteItemModel');
const creditNoteModel = require('../v2models/creditNoteModel');
const organisation = require('../v2models/organisationModel');
const distributorService = require('./distributorService');

module.exports = {
  creditNoteEntry: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const returnDate = day + month + year;

      // Generate credit invoice number
      const pharmacyId = await organisation.getPharmacyId(connection, data.orgId);
      const totalResults = await creditNoteModel.getCreditCount(connection, month, year, data.orgId);
      const creditInvoiceNo = `${pharmacyId[0].org_id_main}CR${returnDate}${totalResults[0].total_rows + 1}`;

      // Create credit note items and update batch
      const creditNoteItems = data.creditNoteItems;

      // Determine GST type based on vendor's GSTIN and organization's GSTIN
      const gstType = await distributorService.getGSTType(data.vendorId, data.orgId);

      // Variables to store aggregate totals
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      const lessDiscountPercent = (parseFloat(data.lessDiscount) / parseFloat(data.creditAmt)) * 100;

      // First loop for calculating GST
      creditNoteItems.forEach((item) => {
        // Calculate item totals
        const itemTotal = ((item.creditPriQty * item.ptr) + ((item.ptr / item.conversion) * item.creditSecQty)) * (1 - (lessDiscountPercent / 100));

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

      // Create credit note items and update batch
      const creditNoteData = {
        vendorId: data.vendorId,
        orgId: data.orgId,
        creditAmt: parseFloat(data.creditAmt),
        lessDiscount: parseFloat(data.lessDiscount),
        totalCgst: parseFloat(totalCgstRounded),
        totalSgst: parseFloat(totalSgstRounded),
        totalIgst: parseFloat(totalIgstRounded),
      };

      // Create credit note
      await creditNoteModel.createCreditNote(connection, creditNoteData, creditInvoiceNo);

      await Promise.all(
        creditNoteItems.map(async (item) => {
          creditNoteItemModel.createCreditNoteItem(connection, item, creditInvoiceNo);
          batchModel.updateBatchAfterCreditEntry(connection, item);
        }),
      );

      return creditInvoiceNo;
    });
  },

  getFilteredCreditNotes: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return creditNoteModel.getCreditNotesBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
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
        return creditNoteModel.getCreditNoteForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return creditNoteModel.getCreditNoteForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return creditNoteModel.getCreditNoteForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });
  },

};
