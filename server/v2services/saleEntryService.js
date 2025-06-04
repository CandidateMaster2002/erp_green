/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const organisationModel = require('../v2models/organisationModel');
const customerMasterModel = require('../v2models/customerMasterModel');
const saleEntryModel = require('../v2models/saleEntryModel');
const saleEntryItemModel = require('../v2models/saleEntryItemModel');
const batchModel = require('../v2models/batchModel');

module.exports = {
  saleEntry: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const saleDate = day + month + year;

      // Create sale entry --> saleInvoiceNo
      const pharmacyId = await organisationModel.getPharmacyId(connection, data.orgId);
      const totalResults = await saleEntryModel.getSaleEntryCount(connection, month, year, data.orgId);
      const saleInvoiceNo = `${pharmacyId[0].org_id_main}SA${saleDate}${totalResults[0].total_rows + 1}`;

      const customerDetails = data.customerDetails;
      const saleEntryItems = data.saleEntryItems;

      // Check if customer exists
      if (!customerDetails.customerId) {
        // Create customer
        const customerId = await customerMasterModel.createCustomer(connection, customerDetails, data.orgId);
        customerDetails.customerId = customerId;
      }

      // Create sale entry
      const orderId = await saleEntryModel.createSaleEntry(connection, data, saleInvoiceNo, customerDetails.customerId);

      await Promise.all(
        saleEntryItems.map(async (item) => {
          saleEntryItemModel.createSaleEntryItem(connection, item, saleInvoiceNo, orderId);
          batchModel.updateBatchAfterSale(connection, item);
        }),
      );
      return orderId;
    });
  },

  getTotalSaleAmount: async (orgId) => {
    return executeTransaction(async (connection) => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      let startYear;
      let endYear;

      if (currentMonth < 3) { // If the current month is before April
        startYear = currentYear - 1;
        endYear = currentYear;
      } else {
        startYear = currentYear;
        endYear = currentYear + 1;
      }

      const startDate = `${startYear}-04-01`;
      const endDate = `${endYear}-03-31`;
      return saleEntryModel.getTotalSaleAmount(connection, orgId, startDate, endDate);
    });
  },

  getTotalSaleEntries: async (orgId) => {
    return executeTransaction(async (connection) => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      let startYear;
      let endYear;

      if (currentMonth < 3) { // If the current month is before April
        startYear = currentYear - 1;
        endYear = currentYear;
      } else {
        startYear = currentYear;
        endYear = currentYear + 1;
      }

      const startDate = `${startYear}-04-01`;
      const endDate = `${endYear}-03-31`;
      return saleEntryModel.getTotalSaleEntries(connection, orgId, startDate, endDate);
    });
  },

  getFilteredSaleEntries: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return saleEntryModel.getSaleEntriesBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
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
        return saleEntryModel.getSaleEntryForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return saleEntryModel.getSaleEntryForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return saleEntryModel.getSaleEntryForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });
  },
};
