/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const organisationModel = require('../v2models/organisationModel');
const purchaseOrderItemModel = require('../v2models/purchaseOrderItemModel');
const purchaseOrderModel = require('../v2models/purchaseOrderModel');

module.exports = {
  createPurchaseOrder: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const purchaseOrderDate = day + month + year;

      // Generate purchase order number
      const pharmacyId = await organisationModel.getPharmacyId(connection, data.orgId);
      // eslint-disable-next-line max-len
      const totalResults = await purchaseOrderModel.getPurchaseOrderCount(connection, month, year, data.orgId);
      const purchaseOrderNo = `${pharmacyId[0].org_id_main}PO${purchaseOrderDate}${totalResults[0].total_rows + 1}`;

      // Create purchase order
      await purchaseOrderModel.createPurchaseOrder(connection, data, purchaseOrderNo);

      // Create purchase order items
      const purchaseOrderItems = data.purchaseOrderItems;

      await Promise.all(
        purchaseOrderItems.map(async (item) => {
          purchaseOrderItemModel.createPurchaseOrderItem(connection, item, purchaseOrderNo);
        }),
      );

      return purchaseOrderNo;
    });
  },

  getFilteredPurchaseOrders: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return purchaseOrderModel.getPurchaseOrdersBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
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
        return purchaseOrderModel.getPurchaseOrderForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return purchaseOrderModel.getPurchaseOrderForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return purchaseOrderModel.getPurchaseOrderForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });
  },
};
