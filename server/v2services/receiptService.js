/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const organisationModel = require('../v2models/organisationModel');
const customerMasterModel = require('../v2models/customerMasterModel');
const saleEntryModel = require('../v2models/saleEntryModel');
const saleEntryItemModel = require('../v2models/saleEntryItemModel');
const saleReturnModel = require('../v2models/saleReturnModel');
const saleReturnItemModel = require('../v2models/saleReturnItemModel');
const purchaseEntryModel = require('../v2models/purchaseEntryModel');
const distributorMasterModel = require('../v2models/distributorMasterModel');
const purchaseEntryItemModel = require('../v2models/purchaseEntryItemModel');
const purchaseOrderModel = require('../v2models/purchaseOrderModel');
const purchaseOrderItemModel = require('../v2models/purchaseOrderItemModel');
const creditNoteModel = require('../v2models/creditNoteModel');
const creditNoteItemModel = require('../v2models/creditNoteItemModel');
const debitNoteModel = require('../v2models/debitNoteModel');
const debitNoteItemModel = require('../v2models/debitNoteItemModel');

module.exports = {
  getSaleEntryReceipt: async (orderId) => {
    return executeTransaction(async (connection) => {
      const transactions = [];

      const salesDetails = await saleEntryModel.getSaleEntryById(connection, orderId);

      if (salesDetails.length === 0) {
        throw new Error('Sales details not found');
      }

      const orgDetails = await organisationModel.getOrgById(connection, salesDetails[0].org_id);

      const customerDetails = await customerMasterModel.getCustomerById(connection, salesDetails[0].customer_id);

      const items = await saleEntryItemModel.getSaleEntryItemsByOrderId(connection, orderId);

      const addDiscPercent = (salesDetails[0].total_dist / salesDetails[0].subtotal) * 100;

      items.forEach((item) => {
        // eslint-disable-next-line max-len
        const grossValue = ((item.saled_pri_qty_cart * item.unit_mrp + item.saled_sec_qty_cart * (item.unit_mrp / item.conversion)) * (1 - (item.unit_discount / 100))) / (1 + (item.gst / 100));
        const transaction = {
          grossAmount: grossValue * (1 - (addDiscPercent / 100)),
          gstRate: item.gst,
        };

        transactions.push(transaction);
      });

      const totals = {
        0: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        5: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        12: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        18: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        total: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        grandTotal: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
      };

      // Calculate totals
      transactions.forEach((transaction) => {
        // If this GST rate hasn't been seen before, add it to totals
        if (!(transaction.gstRate in totals)) {
          totals[transaction.gstRate] = {
            taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
          };
        }

        const gstAmount = transaction.grossAmount * (transaction.gstRate / 100);
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        totals[transaction.gstRate].taxAmt += transaction.grossAmount;
        totals[transaction.gstRate].cgst += cgst;
        totals[transaction.gstRate].sgst += sgst;
        totals[transaction.gstRate].totalGst += gstAmount;

        totals.total.taxAmt += transaction.grossAmount;
        totals.total.cgst += cgst;
        totals.total.sgst += sgst;
        totals.total.totalGst += gstAmount;

        totals.grandTotal.taxAmt += transaction.grossAmount;
        totals.grandTotal.cgst += cgst;
        totals.grandTotal.sgst += sgst;
        totals.grandTotal.totalGst += gstAmount;
      });

      return {
        orgDetails: orgDetails[0],
        salesDetails: salesDetails[0],
        customerDetails: customerDetails[0],
        salesCartItems: items,
        gstBreakup: totals,
      };
    });
  },

  getSaleReturnReceipt: async (returnId) => {
    return executeTransaction(async (connection) => {
      const returnDetails = await saleReturnModel.getSaleReturnById(connection, returnId);

      if (returnDetails.length === 0) {
        throw new Error('Return details not found');
      }

      const orgDetails = await organisationModel.getOrgById(connection, returnDetails[0].org_id);

      const customerDetails = await customerMasterModel.getCustomerById(connection, returnDetails[0].customer_id);

      const items = await saleReturnItemModel.getSaleReturnItemsByReturnId(connection, returnId);

      return {
        orgDetails: orgDetails[0],
        returnDetails: returnDetails[0],
        customerDetails: customerDetails[0],
        returnCartItems: items,
      };
    });
  },

  getPurchaseEntryReceipt: async (grnId) => {
    return executeTransaction(async (connection) => {
      const transactions = [];

      const grnDetails = await purchaseEntryModel.getPurchaseEntryById(connection, grnId);

      if (grnDetails.length === 0) {
        throw new Error('GRN details not found');
      }

      const items = await purchaseEntryItemModel.getPurchaseEntryItemsById(connection, grnId);

      const orgDetails = await organisationModel.getOrgById(connection, grnDetails[0].org_id);

      const vendorDetails = await distributorMasterModel.getDistributorById(connection, grnDetails[0].vendor_id);

      let totalGross = 0;
      let totalGST = 0;
      let totalAmount = 0;
      const lessDiscountPercent = (grnDetails[0].less_discount / grnDetails[0].total) * 100;

      items.forEach((item) => {
        // eslint-disable-next-line max-len
        const grossValue = (item.qty - item.free) * item.purchase * (1 - item.bulk_discount / 100);
        const gstValue = grossValue * (1 - (lessDiscountPercent / 100)) * (item.gst / 100);

        const transaction = {
          grossAmount: grossValue * (1 - (lessDiscountPercent / 100)),
          gstRate: item.gst,
        };
        transactions.push(transaction);

        totalGross += grossValue;
        totalGST += gstValue;
      });

      const totals = {
        0: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        5: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        12: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        18: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        total: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        grandTotal: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
      };

      // Calculate totals
      transactions.forEach((transaction) => {
        // If this GST rate hasn't been seen before, add it to totals
        if (!(transaction.gstRate in totals)) {
          totals[transaction.gstRate] = {
            taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
          };
        }

        const gstAmount = transaction.grossAmount * (transaction.gstRate / 100);
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        totals[transaction.gstRate].taxAmt += transaction.grossAmount;
        totals[transaction.gstRate].cgst += cgst;
        totals[transaction.gstRate].sgst += sgst;
        totals[transaction.gstRate].totalGst += gstAmount;

        totals.total.taxAmt += transaction.grossAmount;
        totals.total.cgst += cgst;
        totals.total.sgst += sgst;
        totals.total.totalGst += gstAmount;

        totals.grandTotal.taxAmt += transaction.grossAmount;
        totals.grandTotal.cgst += cgst;
        totals.grandTotal.sgst += sgst;
        totals.grandTotal.totalGst += gstAmount;
      });

      totalAmount = totalGross + totalGST - grnDetails[0].less_discount + grnDetails[0].credit_debit;

      return {
        orgDetails: orgDetails[0],
        grnDetails: grnDetails[0],
        vendorDetails: vendorDetails[0],
        grnCartItems: items,
        gstBreakup: totals,
        totalGross,
        totalGST,
        totalAmount,
      };
    });
  },

  getPurchaseOrderReceipt: async (poId) => {
    return executeTransaction(async (connection) => {
      let totalPoAmount = 0;

      const poDetails = await purchaseOrderModel.getPurchaseOrderById(connection, poId);

      if (poDetails.length === 0) {
        throw new Error('PO details not found');
      }

      const items = await purchaseOrderItemModel.getPurchaseOrderItemsById(connection, poDetails[0].po_id_main);

      const orgDetails = await organisationModel.getOrgById(connection, poDetails[0].org_id);

      const vendorDetails = await distributorMasterModel.getDistributorById(connection, poDetails[0].vendor_id);

      items.forEach((item) => {
        totalPoAmount += parseFloat(item.amount);
      });

      return {
        orgDetails: orgDetails[0],
        vendorDetails: vendorDetails[0],
        poDetails: poDetails[0],
        poItems: items,
        totalPoAmount: totalPoAmount.toFixed(2),
      };
    });
  },

  getCreditNoteReceipt: async (creditNoteId) => {
    return executeTransaction(async (connection) => {
      const transactions = [];

      const creditNoteDetails = await creditNoteModel.getCreditNoteById(connection, creditNoteId);

      if (creditNoteDetails.length === 0) {
        throw new Error('Credit note details not found');
      }

      const items = await creditNoteItemModel.getCreditNoteItemsById(connection, creditNoteId);

      const orgDetails = await organisationModel.getOrgById(connection, creditNoteDetails[0].org_id);

      const vendorDetails = await distributorMasterModel.getDistributorById(connection, creditNoteDetails[0].vendor_id);

      let totalGross = 0;
      let totalGST = 0;
      let totalAmount = 0;

      const lessDiscountPercent = (creditNoteDetails[0].less_discount / creditNoteDetails[0].credit_amt) * 100;

      items.forEach((item) => {
        const grossValue = (item.pri_unit_credit * item.purchase_rate) + ((item.purchase_rate / item.conversion) * item.sec_unit_credit);
        const gstValue = grossValue * (1 - (lessDiscountPercent / 100)) * (item.gst / 100);

        const transaction = {
          grossAmount: grossValue * (1 - (lessDiscountPercent / 100)),
          gstRate: item.gst,
        };
        transactions.push(transaction);

        totalGross += grossValue;
        totalGST += gstValue;
      });

      const totals = {
        0: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        5: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        12: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        18: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        total: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        grandTotal: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
      };

      // Calculate totals
      transactions.forEach((transaction) => {
        // If this GST rate hasn't been seen before, add it to totals
        if (!(transaction.gstRate in totals)) {
          totals[transaction.gstRate] = {
            taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
          };
        }

        const gstAmount = transaction.grossAmount * (transaction.gstRate / 100);
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        totals[transaction.gstRate].taxAmt += transaction.grossAmount;
        totals[transaction.gstRate].cgst += cgst;
        totals[transaction.gstRate].sgst += sgst;
        totals[transaction.gstRate].totalGst += gstAmount;

        totals.total.taxAmt += transaction.grossAmount;
        totals.total.cgst += cgst;
        totals.total.sgst += sgst;
        totals.total.totalGst += gstAmount;

        totals.grandTotal.taxAmt += transaction.grossAmount;
        totals.grandTotal.cgst += cgst;
        totals.grandTotal.sgst += sgst;
        totals.grandTotal.totalGst += gstAmount;
      });

      totalAmount = totalGross + totalGST - creditNoteDetails[0].less_discount;
      return {
        orgDetails: orgDetails[0],
        vendorDetails: vendorDetails[0],
        creditNoteDetails: creditNoteDetails[0],
        creditNoteItems: items,
        gstBreakup: totals,
        totalGross,
        totalGST,
        totalAmount,
      };
    });
  },

  getDebitNoteReceipt: async (debitNoteId) => {
    return executeTransaction(async (connection) => {
      const transactions = [];

      const debitNoteDetails = await debitNoteModel.getDebitNoteById(connection, debitNoteId);

      if (debitNoteDetails.length === 0) {
        throw new Error('Debit note details not found');
      }

      const items = await debitNoteItemModel.getDebitNoteItemsById(connection, debitNoteId);

      const orgDetails = await organisationModel.getOrgById(connection, debitNoteDetails[0].org_id);

      const vendorDetails = await distributorMasterModel.getDistributorById(connection, debitNoteDetails[0].vendor_id);

      let totalGross = 0;
      let totalGST = 0;
      let totalAmount = 0;

      const lessDiscountPercent = (debitNoteDetails[0].less_discount / debitNoteDetails[0].debit_amt) * 100;

      items.forEach((item) => {
        const grossValue = (item.pri_unit_debit * item.purchase_rate) + ((item.purchase_rate / item.conversion) * item.sec_unit_debit);
        const gstValue = grossValue * (1 - (lessDiscountPercent / 100)) * (item.gst / 100);

        const transaction = {
          grossAmount: grossValue * (1 - (lessDiscountPercent / 100)),
          gstRate: item.gst,
        };
        transactions.push(transaction);

        totalGross += grossValue;
        totalGST += gstValue;
      });

      const totals = {
        0: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        5: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        12: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        18: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        total: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
        grandTotal: {
          taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
        },
      };

      // Calculate totals
      transactions.forEach((transaction) => {
        // If this GST rate hasn't been seen before, add it to totals
        if (!(transaction.gstRate in totals)) {
          totals[transaction.gstRate] = {
            taxAmt: 0, cgst: 0, sgst: 0, totalGst: 0,
          };
        }

        const gstAmount = transaction.grossAmount * (transaction.gstRate / 100);
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        totals[transaction.gstRate].taxAmt += transaction.grossAmount;
        totals[transaction.gstRate].cgst += cgst;
        totals[transaction.gstRate].sgst += sgst;
        totals[transaction.gstRate].totalGst += gstAmount;

        totals.total.taxAmt += transaction.grossAmount;
        totals.total.cgst += cgst;
        totals.total.sgst += sgst;
        totals.total.totalGst += gstAmount;

        totals.grandTotal.taxAmt += transaction.grossAmount;
        totals.grandTotal.cgst += cgst;
        totals.grandTotal.sgst += sgst;
        totals.grandTotal.totalGst += gstAmount;
      });

      totalAmount = totalGross + totalGST - debitNoteDetails[0].less_discount;

      return {
        orgDetails: orgDetails[0],
        vendorDetails: vendorDetails[0],
        debitNoteDetails: debitNoteDetails[0],
        debitNoteItems: items,
        gstBreakup: totals,
        totalGross,
        totalGST,
        totalAmount,
      };
    });
  },

};
