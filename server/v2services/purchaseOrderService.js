/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
// Temporarily commenting out model imports as we are serving dummy data for reports.
const { executeTransaction } = require('../utils/transaction.util');
const organisationModel = require('../v2models/organisationModel');
const purchaseOrderItemModel = require('../v2models/purchaseOrderItemModel');
const purchaseOrderModel = require('../v2models/purchaseOrderModel');



/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
// const { executeTransaction } = require('../utils/transaction.util');
// const organisationModel = require('../v2models/organisationModel');
// const purchaseOrderItemModel = require('../v2models/purchaseOrderItemModel');
// const purchaseOrderModel = require('../v2models/purchaseOrderModel');
const distributorMasterModel = require('../v2models/distributorMasterModel');


module.exports = {
  // Function: createPurchaseOrder - START
  createPurchaseOrder: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const purchaseOrderDate = day + month + year;

      const pharmacyId = await organisationModel.getPharmacyId(connection, data.orgId);
      const totalResults = await purchaseOrderModel.getPurchaseOrderCount(connection, month, year, data.orgId);
      const purchaseOrderNo = `${pharmacyId[0].org_id_main}PO${purchaseOrderDate}${totalResults[0].total_rows + 1}`;

      await purchaseOrderModel.createPurchaseOrder(connection, data, purchaseOrderNo);

      const purchaseOrderItems = data.purchaseOrderItems;
      await Promise.all(
        purchaseOrderItems.map(async (item) => {
          await purchaseOrderItemModel.createPurchaseOrderItem(connection, item, purchaseOrderNo);
        })
      );

      return purchaseOrderNo;
    });
  },
  // Function: createPurchaseOrder - END

  // Function: getFilteredPurchaseOrders - START
  getFilteredPurchaseOrders: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setDate(endDate.getDate() + 1);
        return purchaseOrderModel.getPurchaseOrdersBetweenDates(connection, filter.startDate, endDate, filter.orgId);
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
        } else {
          throw new Error('Invalid quarter provided');
        }
        return purchaseOrderModel.getPurchaseOrderForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        return purchaseOrderModel.getPurchaseOrderForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarter) {
        return purchaseOrderModel.getPurchaseOrderForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });
  },
  // Function: getFilteredPurchaseOrders - END

  // Function: getPurchaseOrderReceipt - START
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
  // Function: getPurchaseOrderReceipt - END
};
