/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const { getStateFromGSTIN, getGSTType } = require('../utils/gstin.util');
const { getStateFromPincode } = require('../utils/pincode.util');
const categoryReportRepository = require('../v2repositories/categoryReportRepository');
const generalLedgerRepository = require('../v2repositories/generalLedgerRepository');
const gstReportRepository = require('../v2repositories/gstReportRepository');
const partyTransactionRepository = require('../v2repositories/partyTransactionRepository');
const productTransactionRepository = require('../v2repositories/productTransactionRepository');
const organisationModel = require('../v2models/organisationModel');

module.exports = {
  getFilteredSaledCategory: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return categoryReportRepository.getSaledCategoryBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId, 15);
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
        return categoryReportRepository.getSaledCategoryForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId, 15);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return categoryReportRepository.getSaledCategoryForMonth(connection, filter.month, filter.year, filter.orgId, 15);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return categoryReportRepository.getSaledCategoryForYear(connection, filter.year, filter.orgId, 15);
      }

      throw new Error('Invalid filters provided');
    });
  },

  getProductTransactions: async (productId, orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const results = productTransactionRepository.getProductTransactions(connection, productId, orgId, startDate, endDate);
      return results;
    });
  },

  getPartyTransactions: async (partyType, partyId, orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      if (partyType === 'customer') {
        const customerId = partyId;
        const results = partyTransactionRepository.getCustomerTransactions(connection, customerId, orgId, startDate, endDate);
        return results;
      }
      if (partyType === 'distributor') {
        const distributorId = partyId;
        const results = partyTransactionRepository.getDistributorTransactions(connection, distributorId, orgId, startDate, endDate);
        return results;
      }
      throw new Error('Invalid party provided');
    });
  },

  getGeneralLedger: async (accountType, orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      if (accountType === 'allAccounts') {
        return generalLedgerRepository.getAllAcountLedger(connection, orgId, startDate, endDate).then((results) => {
          let balance = 0;
          for (let i = results.length - 1; i >= 0; i -= 1) {
            balance += results[i].credit_amount - results[i].debit_amount;
            if (balance >= 0) {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Cr`;
            } else {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Dr`;
            }
          }
          return results;
        });
      } if (accountType === 'sale') {
        return generalLedgerRepository.getSaleLedger(connection, orgId, startDate, endDate).then((results) => {
          let balance = 0;
          for (let i = results.length - 1; i >= 0; i -= 1) {
            balance += results[i].credit_amount - results[i].debit_amount;
            if (balance >= 0) {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Cr`;
            } else {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Dr`;
            }
          }
          return results;
        });
      } if (accountType === 'purchase') {
        return generalLedgerRepository.getPurchaseLedger(connection, orgId, startDate, endDate).then((results) => {
          let balance = 0;
          for (let i = results.length - 1; i >= 0; i -= 1) {
            balance += results[i].credit_amount - results[i].debit_amount;
            if (balance >= 0) {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Cr`;
            } else {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Dr`;
            }
          }
          return results;
        });
      }
      throw new Error('Invalid account type provided');
    });
  },

  getOutwardB2B: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getOutwardB2CL: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardB2CL(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      await Promise.all(records.map(async (record) => {
        record.subtotal = parseFloat(record.subtotal).toFixed(2);
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Get place of supply from pincode
        const state = await getStateFromPincode(record.pincode);
        record.place_of_supply = `${state}`;

        // Calculate taxable value and tax amount
        const addDiscPercent = (record.total_dist / record.subtotal) * 100;
        const taxableValue = (record.saled_mrp * (1 - (addDiscPercent / 100))) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Group by GST rate and sum taxable value and tax amount
        const gstRate = record.rate;
        if (!summaryByGST[gstRate]) {
          summaryByGST[gstRate] = {
            tax_category: record.tax_category,
            invoice_type: record.type_of_supply,
            place_of_supply: record.place_of_supply,
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
            cess_amount: 0,
            count: 0,
          };
        }
        summaryByGST[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[gstRate].total_value += parseFloat(record.total_value);
        summaryByGST[gstRate].count += 1;
      }));

      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      // Convert summary object to array
      const B2CLSummary = Object.values(summaryByGST).map((item) => {
        totalTaxAmount += parseFloat(item.tax_amount);
        totalTaxableValue += parseFloat(item.taxable_value);
        totalInvoiceValue += parseFloat(item.total_value);

        return {
          ...item,
          taxable_value: item.taxable_value.toFixed(2),
          tax_amount: item.tax_amount.toFixed(2),
          total_value: item.total_value.toFixed(2),
        };
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: B2CLSummary,
      };
    });
  },

  getOutwardB2CS: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardB2CS(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      await Promise.all(records.map(async (record) => {
        record.subtotal = parseFloat(record.subtotal).toFixed(2);
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Get place of supply from pincode
        const state = await getStateFromPincode(record.pincode);
        record.place_of_supply = `${state}`;

        // Calculate taxable value and tax amount
        const addDiscPercent = (record.total_dist / record.subtotal) * 100;
        const taxableValue = (record.saled_mrp * (1 - (addDiscPercent / 100))) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Group by GST rate and sum taxable value and tax amount
        const gstRate = record.rate;
        if (!summaryByGST[gstRate]) {
          summaryByGST[gstRate] = {
            tax_category: record.tax_category,
            invoice_type: record.type_of_supply,
            place_of_supply: record.place_of_supply,
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
            cess_amount: 0,
            count: 0,
          };
        }
        summaryByGST[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[gstRate].total_value += parseFloat(record.total_value);
        summaryByGST[gstRate].count += 1;
      }));

      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      // Convert summary object to array
      const B2CSSummary = Object.values(summaryByGST).map((item) => {
        totalTaxAmount += parseFloat(item.tax_amount);
        totalTaxableValue += parseFloat(item.taxable_value);
        totalInvoiceValue += parseFloat(item.total_value);

        return {
          ...item,
          taxable_value: item.taxable_value.toFixed(2),
          tax_amount: item.tax_amount.toFixed(2),
          total_value: item.total_value.toFixed(2),
        };
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: B2CSSummary,
      };
    });
  },

  getOutwardNilExemp: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardNilExemp(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.subtotal = parseFloat(record.subtotal).toFixed(2);
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Calculate taxable value and tax amount
        record.taxable_value = record.grand_total;
        record.tax_amount = 0;
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Group by GST rate and sum taxable value and tax amount
        const gstRate = record.rate;
        if (!summaryByGST[gstRate]) {
          summaryByGST[gstRate] = {
            tax_category: record.tax_category,
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
            cess_amount: 0,
            count: 0,
          };
        }
        summaryByGST[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[gstRate].total_value += parseFloat(record.total_value);
        summaryByGST[gstRate].count += 1;
      });

      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      // Convert summary object to array
      const nilExempSummary = Object.values(summaryByGST).map((item) => {
        totalTaxAmount += parseFloat(item.tax_amount);
        totalTaxableValue += parseFloat(item.taxable_value);
        totalInvoiceValue += parseFloat(item.total_value);

        return {
          ...item,
          taxable_value: item.taxable_value.toFixed(2),
          tax_amount: item.tax_amount.toFixed(2),
          total_value: item.total_value.toFixed(2),
        };
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: nilExempSummary,
      };
    });
  },

  getOutwardCDNR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardCDNR(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.note_value = parseFloat(record.note_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_debit = parseFloat(record.total_debit).toFixed(2);
        record.debit_amt = parseFloat(record.debit_amt).toFixed(2);

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.debit_amt) * 100;
        const taxableValue = (record.debit_amt * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Get state from GSTIN
        const stateCode = record.receipient_gstin.slice(0, 2);
        const state = getStateFromGSTIN(record.receipient_gstin);
        record.place_of_supply = `${stateCode}-${state}`;

        // Group by Note number and gst rate within further sum taxable value and tax amount for same rate
        const noteNumber = record.note_number;
        const gstRate = record.rate;
        if (!summaryByGST[noteNumber]) {
          summaryByGST[noteNumber] = {
            receipient_gstin: record.receipient_gstin,
            receiver_name: record.receiver_name,
            note_number: record.note_number,
            place_of_supply: record.place_of_supply,
            note_type: record.note_type,
            note_supply_type: record.note_supply_type,
            note_date: record.note_date,
            note_value: record.note_value,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByGST[noteNumber].gst[gstRate]) {
            summaryByGST[noteNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[noteNumber].gst[gstRate]) {
          summaryByGST[noteNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[noteNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[noteNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[noteNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      });

      // Convert summary object to array
      const CDNRSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
        note_value: parseFloat(item.note_value).toFixed(2),
      }));

      // Denormalize nested array of gst rates
      const denomCDNRSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      CDNRSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);

          denomCDNRSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: denomCDNRSummary,
      };
    });
  },

  getOutwardCDNUR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getOutwardExport: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getTaxLiableAdvanceReceive: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getAdjustAdvance: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getHSNWiseOutwardSupply: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const summaryByHSN = {};

      // eslint-disable-next-line camelcase
      const { org_gstin } = await organisationModel.getOrgGSTIN(connection, orgId);

      // Get sale records
      const saleRecords = await gstReportRepository.outwardHSNWiseSaleDetails(connection, orgId, startDate, endDate);
      saleRecords.forEach((record) => {
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const addDiscPercent = (record.total_dist / record.subtotal) * 100;
        const taxableValue = (record.saled_mrp * (1 - (addDiscPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, org_gstin);
        if (gstType === 'intra') {
          record.cgst = taxableValue * (record.rate / 2 / 100);
          record.sgst = taxableValue * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = taxableValue * (record.rate / 100);
        }

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Get Debit Note records
      const debitRecords = await gstReportRepository.outwardHSNWiseDebitDetails(connection, orgId, startDate, endDate);
      debitRecords.forEach((record) => {
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_debit = parseFloat(record.total_debit).toFixed(2);
        record.debit_amt = parseFloat(record.debit_amt).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.debit_amt) * 100;
        const taxableValue = (record.debit_amt * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, org_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Convert summary object to array
      const summaryArray = Object.values(summaryByHSN).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          total_value: gst.total_value.toFixed(2),
          taxable_value: gst.taxable_value.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          quantity: gst.quantity,
        })),
      }));

      // Denormalize nested array of gst rates
      const denomSummaryArray = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      summaryArray.forEach((item) => {
        const { gst, cess_amount, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);

          denomSummaryArray.push({
            ...rest,
            uqc: 'PCS-PIECES', // Default unit code set to PCS-PIECES temporarily
            rate: gstItem.rate,
            quantity: gstItem.quantity,
            total_value: gstItem.total_value,
            taxable_value: gstItem.taxable_value,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount,
            tax_amount: gstItem.tax_amount,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: denomSummaryArray,
      };
    });
  },

  getInwardB2B: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.inwardB2B(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.invoice_value = parseFloat(record.invoice_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_gross = parseFloat(record.total_gross).toFixed(2);
        record.item_value = parseFloat(record.item_value).toFixed(2);

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.total_gross) * 100;
        const taxableValue = (record.item_value * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Get state from GSTIN
        const stateCode = record.receipient_gstin.slice(0, 2);
        const state = getStateFromGSTIN(record.receipient_gstin);
        record.place_of_supply = `${stateCode}-${state}`;

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, record.supplier_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by Invoice number and gst rate within further sum taxable value and tax amount for same rate
        const invoiceNumber = record.invoice_number;
        const gstRate = record.rate;
        if (!summaryByGST[invoiceNumber]) {
          summaryByGST[invoiceNumber] = {
            receipient_gstin: record.receipient_gstin,
            receiver_name: record.receiver_name,
            invoice_number: record.invoice_number,
            bill_number: record.bill_number,
            invoice_date: record.invoice_date,
            place_of_supply: record.place_of_supply,
            type_of_supply: record.type_of_supply,
            invoice_value: record.invoice_value,
            gst: {},
          };
          if (!summaryByGST[invoiceNumber].gst[gstRate]) {
            summaryByGST[invoiceNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              cess_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[invoiceNumber].gst[gstRate]) {
          summaryByGST[invoiceNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[invoiceNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[invoiceNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[invoiceNumber].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      });

      // Convert summary object to array
      const inwardB2BSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          cess_amount: gst.cess_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
      }));

      // Denormalize nested array of gst rates
      const denomInwardB2BSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalCGSTValue = 0;
      let totalSGSTValue = 0;
      let totalIGSTValue = 0;
      let totalCessValue = 0;
      let totalInvoiceValue = 0;

      inwardB2BSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);
          totalCGSTValue += parseFloat(gstItem.cgst);
          totalSGSTValue += parseFloat(gstItem.sgst);
          totalIGSTValue += parseFloat(gstItem.igst);
          totalCessValue += parseFloat(gstItem.cess_amount);

          denomInwardB2BSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount: gstItem.cess_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        total_cgst_value: totalCGSTValue.toFixed(2), // Total CGST value
        total_sgst_value: totalSGSTValue.toFixed(2), // Total SGST value
        total_igst_value: totalIGSTValue.toFixed(2), // Total IGST value
        total_cess_value: totalCessValue.toFixed(2), // Total Cess value
        data: denomInwardB2BSummary,
      };
    });
  },

  getInwardCDNR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_cgst_value: 0,
        total_sgst_value: 0,
        total_igst_value: 0,
        total_cess_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getImportServices: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_cgst_value: 0,
        total_sgst_value: 0,
        total_igst_value: 0,
        total_cess_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getImportGoods: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_cgst_value: 0,
        total_sgst_value: 0,
        total_igst_value: 0,
        total_cess_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getInwardNilExemp: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.inwardNilExemp(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.invoice_value = parseFloat(record.invoice_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_gross = parseFloat(record.total_gross).toFixed(2);
        record.item_value = parseFloat(record.item_value).toFixed(2);

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.total_gross) * 100;
        const taxableValue = (record.item_value * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Get state from GSTIN
        const stateCode = record.receipient_gstin.slice(0, 2);
        const state = getStateFromGSTIN(record.receipient_gstin);
        record.place_of_supply = `${stateCode}-${state}`;

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, record.supplier_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by Invoice number and gst rate within further sum taxable value and tax amount for same rate
        const invoiceNumber = record.invoice_number;
        const gstRate = record.rate;
        if (!summaryByGST[invoiceNumber]) {
          summaryByGST[invoiceNumber] = {
            receipient_gstin: record.receipient_gstin,
            receiver_name: record.receiver_name,
            invoice_number: record.invoice_number,
            bill_number: record.bill_number,
            invoice_date: record.invoice_date,
            place_of_supply: record.place_of_supply,
            type_of_supply: record.type_of_supply,
            invoice_value: record.invoice_value,
            gst: {},
          };
          if (!summaryByGST[invoiceNumber].gst[gstRate]) {
            summaryByGST[invoiceNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              cess_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[invoiceNumber].gst[gstRate]) {
          summaryByGST[invoiceNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[invoiceNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[invoiceNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[invoiceNumber].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      });

      // Convert summary object to array
      const inwardNilExempSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          cess_amount: gst.cess_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
      }));

      // Denormalize nested array of gst rates
      const denomInwardNilExempSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalCGSTValue = 0;
      let totalSGSTValue = 0;
      let totalIGSTValue = 0;
      let totalCessValue = 0;
      let totalInvoiceValue = 0;

      inwardNilExempSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);
          totalCGSTValue += parseFloat(gstItem.cgst);
          totalSGSTValue += parseFloat(gstItem.sgst);
          totalIGSTValue += parseFloat(gstItem.igst);
          totalCessValue += parseFloat(gstItem.cess_amount);

          denomInwardNilExempSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount: gstItem.cess_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        total_cgst_value: totalCGSTValue.toFixed(2), // Total CGST value
        total_sgst_value: totalSGSTValue.toFixed(2), // Total SGST value
        total_igst_value: totalIGSTValue.toFixed(2), // Total IGST value
        total_cess_value: totalCessValue.toFixed(2), // Total Cess value
        data: denomInwardNilExempSummary,
      };
    });
  },

  getInwardCDNUR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.inwardCDNUR(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      await Promise.all(records.map(async (record) => {
        record.note_value = parseFloat(record.note_value).toFixed(2);
        record.return_total = parseFloat(record.return_total).toFixed(2);

        // Get place of supply from pincode
        const state = await getStateFromPincode(record.pincode);
        record.place_of_supply = `${state}`;

        // Calculate taxable value and tax amount
        const taxableValue = (record.return_total) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        record.cgst = record.taxable_value * (record.rate / 2 / 100);
        record.sgst = record.taxable_value * (record.rate / 2 / 100);

        // Group by Invoice number and gst rate within further sum taxable value and tax amount for same rate
        const noteNumber = record.note_number;
        const gstRate = record.rate;
        if (!summaryByGST[noteNumber]) {
          summaryByGST[noteNumber] = {
            original_invoice_number: record.original_invoice_number,
            original_invoice_date: record.original_invoice_date,
            note_number: record.note_number,
            note_date: record.note_date,
            note_type: record.note_type,
            type_of_supply: record.type_of_supply,
            place_of_supply: record.place_of_supply,
            gst: {},
          };
          if (!summaryByGST[noteNumber].gst[gstRate]) {
            summaryByGST[noteNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              cess_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[noteNumber].gst[gstRate]) {
          summaryByGST[noteNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[noteNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[noteNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[noteNumber].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByGST[noteNumber].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByGST[noteNumber].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByGST[noteNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      }));

      // Convert summary object to array
      const inwardCDNURSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          cess_amount: gst.cess_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
      }));

      // Denormalize nested array of gst rates
      const denomInwardCDNURSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalCGSTValue = 0;
      let totalSGSTValue = 0;
      let totalIGSTValue = 0;
      let totalCessValue = 0;
      let totalInvoiceValue = 0;

      inwardCDNURSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);
          totalCGSTValue += parseFloat(gstItem.cgst);
          totalSGSTValue += parseFloat(gstItem.sgst);
          totalIGSTValue += parseFloat(gstItem.igst);
          totalCessValue += parseFloat(gstItem.cess_amount);

          denomInwardCDNURSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount: gstItem.cess_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        total_cgst_value: totalCGSTValue.toFixed(2), // Total CGST value
        total_sgst_value: totalSGSTValue.toFixed(2), // Total SGST value
        total_igst_value: totalIGSTValue.toFixed(2), // Total IGST value
        total_cess_value: totalCessValue.toFixed(2), // Total Cess value
        data: denomInwardCDNURSummary,
      };
    });
  },

  getHSNWiseInwardSupply: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const summaryByHSN = {};

      // eslint-disable-next-line camelcase
      const { org_gstin } = await organisationModel.getOrgGSTIN(connection, orgId);

      // Get purchase records
      const purchaseRecords = await gstReportRepository.inwardHSNWisePurchaseDetails(connection, orgId, startDate, endDate);
      purchaseRecords.forEach((record) => {
        record.invoice_value = parseFloat(record.invoice_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_gross = parseFloat(record.total_gross).toFixed(2);
        record.item_value = parseFloat(record.item_value).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.total_gross) * 100;
        const taxableValue = (record.item_value * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, record.supplier_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Get Sale Return records
      const saleReturnRecords = await gstReportRepository.inwardHSNWiseSaleReturnDetails(connection, orgId, startDate, endDate);
      saleReturnRecords.forEach((record) => {
        record.return_amount = parseFloat(record.return_amount).toFixed(2);
        record.return_total = parseFloat(record.return_total).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const taxableValue = (record.return_total) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        record.cgst = record.taxable_value * (record.rate / 2 / 100);
        record.sgst = record.taxable_value * (record.rate / 2 / 100);

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Convert summary object to array
      const summaryArray = Object.values(summaryByHSN).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          total_value: gst.total_value.toFixed(2),
          taxable_value: gst.taxable_value.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          quantity: gst.quantity,
        })),
      }));

      // Denormalize nested array of gst rates
      const denomSummaryArray = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      summaryArray.forEach((item) => {
        const { gst, cess_amount, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);

          denomSummaryArray.push({
            ...rest,
            uqc: 'PCS-PIECES', // Default unit code set to PCS-PIECES temporarily
            rate: gstItem.rate,
            quantity: gstItem.quantity,
            total_value: gstItem.total_value,
            taxable_value: gstItem.taxable_value,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount,
            tax_amount: gstItem.tax_amount,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: denomSummaryArray,
      };
    });
  },
};
