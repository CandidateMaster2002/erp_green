/* eslint-disable max-len */
const { getPool } = require('../config/database');

module.exports = {
  getSalesReceipt: async (orderId) => {
    try {
      const pool = getPool().promise();
      const transactions = [];

      const [salesDetails] = await pool.query(
        `SELECT * FROM order_details
          WHERE order_id = ?`,
        [orderId],
      );

      if (salesDetails.length === 0) {
        throw new Error('Sales details not found');
      }

      const [orgDetails] = await pool.query(
        `SELECT * FROM organisation
          WHERE org_id = ?`,
        [salesDetails[0].org_id],
      );

      const [customerDetails] = await pool.query(
        `SELECT * FROM customer_data
          WHERE customer_id = ?`,
        [salesDetails[0].customer_id],
      );

      const [items] = await pool.query(
        `SELECT * FROM cart_item 
              WHERE order_id = ?`,
        [orderId],
      );

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getReturnReceipt: async (returnId) => {
    try {
      const pool = getPool().promise();

      const [returnDetails] = await pool.query(
        `SELECT * FROM return_details rd
        JOIN order_details od 
        ON od.invoice_id_main = rd.sales_invoice_id
        WHERE rd.return_id = ?`,
        [returnId],
      );

      if (returnDetails.length === 0) {
        throw new Error('Return details not found');
      }

      const [orgDetails] = await pool.query(
        `SELECT * FROM organisation
          WHERE org_id = ?`,
        [returnDetails[0].org_id],
      );

      const [customerDetails] = await pool.query(
        `SELECT * FROM customer_data
        WHERE customer_id = ?`,
        [returnDetails[0].customer_id],
      );

      const [items] = await pool.query(
        `SELECT * FROM return_cart_item
        WHERE return_id = ?`,
        [returnId],
      );

      return {
        orgDetails: orgDetails[0],
        returnDetails: returnDetails[0],
        customerDetails: customerDetails[0],
        returnCartItems: items,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getGrnReceipt: async (grnId) => {
    try {
      const pool = getPool().promise();
      const transactions = [];

      const [grnDetails] = await pool.query(
        `SELECT * FROM grn
          WHERE grn_id = ?`,
        [grnId],
      );

      if (grnDetails.length === 0) {
        throw new Error('GRN details not found');
      }

      const [items] = await pool.query(
        `SELECT sample.med_name, grncd.* FROM grn_cart_details grncd
          JOIN sample ON grncd.product_id = sample.product_id
          WHERE grn_id = ?`,
        [grnId],
      );

      const [orgDetails] = await pool.query(
        `SELECT * FROM organisation
          WHERE org_id = ?`,
        [grnDetails[0].org_id],
      );

      const [vendorDetails] = await pool.query(
        `SELECT * FROM vendor
          WHERE vendor_id = ?`,
        [grnDetails[0].vendor_id],
      );

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getPoReceipt: async (poId) => {
    try {
      const pool = getPool().promise();
      let totalPoAmount = 0;

      const [poDetails] = await pool.query(
        `SELECT * FROM purchase_order
          WHERE po_id_main = ?`,
        [poId],
      );

      if (poDetails.length === 0) {
        throw new Error('PO details not found');
      }

      const [items] = await pool.query(
        `SELECT sample.med_name, sample.mfd_mkt, po_items.* FROM po_items
          JOIN sample ON po_items.product_id = sample.product_id
          WHERE po_id_main = ?`,
        [poDetails[0].po_id_main],
      );

      const [orgDetails] = await pool.query(
        `SELECT * FROM organisation
          WHERE org_id = ?`,
        [poDetails[0].org_id],
      );

      const [vendorDetails] = await pool.query(
        `SELECT * FROM vendor
          WHERE vendor_id = ?`,
        [poDetails[0].vendor_id],
      );

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getCreditNoteReceipt: async (creditNoteId) => {
    try {
      const pool = getPool().promise();
      const transactions = [];

      const [creditNoteDetails] = await pool.query(
        `SELECT * FROM credit_note
          WHERE credit_invoice_id = ?`,
        [creditNoteId],
      );

      if (creditNoteDetails.length === 0) {
        throw new Error('Credit note details not found');
      }

      const [items] = await pool.query(
        `SELECT sample.med_name, bth.batch_name, bth.mrp, bth.purchase_rate, bth.conversion, bth.exp_date, inv.hsn, inv.gst, cncd.*  FROM credit_note_cart_details cncd
        JOIN batch bth ON cncd.batch_id_credit = bth.batch_id
        JOIN inventory inv ON bth.inventory_id = inv.inventory_id
        JOIN sample ON cncd.product_id = sample.product_id
        WHERE credit_invoice_id =  ?`,
        [creditNoteId],
      );

      const [orgDetails] = await pool.query(
        `SELECT * FROM organisation
          WHERE org_id = ?`,
        [creditNoteDetails[0].org_id],
      );

      const [vendorDetails] = await pool.query(
        `SELECT * FROM vendor
          WHERE vendor_id = ?`,
        [creditNoteDetails[0].vendor_id],
      );

      let totalGross = 0;
      let totalGST = 0;
      let totalAmount = 0;

      const lessDiscountPercent = (creditNoteDetails[0].less_discount / creditNoteDetails[0].credit_amt) * 100;

      items.forEach((item) => {
        const grossValue = (item.pri_unit_credit * item.purchase_rate) + ((item.purchase_rate / item.conversion) * item.sec_unit_credit);
        const gstValue = grossValue * (item.gst / 100);

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getDebitNoteReceipt: async (debitNoteId) => {
    try {
      const pool = getPool().promise();
      const transactions = [];

      const [debitNoteDetails] = await pool.query(
        `SELECT * FROM debit_note
          WHERE debit_invoice_id = ?`,
        [debitNoteId],
      );

      if (debitNoteDetails.length === 0) {
        throw new Error('Debit note details not found');
      }

      const [items] = await pool.query(
        `SELECT sample.med_name, bth.batch_name, bth.mrp, bth.purchase_rate, bth.conversion, bth.exp_date, inv.hsn, inv.gst, dncd.*  FROM debit_note_cart_details dncd
        JOIN batch bth ON dncd.batch_id_debit = bth.batch_id
        JOIN inventory inv ON bth.inventory_id = inv.inventory_id
        JOIN sample ON dncd.product_id = sample.product_id
        WHERE debit_invoice_id =  ?`,
        [debitNoteId],
      );

      const [orgDetails] = await pool.query(
        `SELECT * FROM organisation
          WHERE org_id = ?`,
        [debitNoteDetails[0].org_id],
      );

      const [vendorDetails] = await pool.query(
        `SELECT * FROM vendor
          WHERE vendor_id = ?`,
        [debitNoteDetails[0].vendor_id],
      );

      let totalGross = 0;
      let totalGST = 0;
      let totalAmount = 0;

      const lessDiscountPercent = (debitNoteDetails[0].less_discount / debitNoteDetails[0].debit_amt) * 100;

      items.forEach((item) => {
        const grossValue = (item.pri_unit_debit * item.purchase_rate) + ((item.purchase_rate / item.conversion) * item.sec_unit_debit);
        const gstValue = grossValue * (item.gst / 100);

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
