/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const batchModel = require('../v2models/batchModel');
const inventoryModel = require('../v2models/inventoryModel');
const organisationModel = require('../v2models/organisationModel');
const productMasterModel = require('../v2models/productMasterModel');
const purchaseEntryItemModel = require('../v2models/purchaseEntryItemModel');
const purchaseEntryModel = require('../v2models/purchaseEntryModel');
const distributorService = require('./distributorService');

module.exports = {
  purchaseEntry: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const returnDate = day + month + year;

      // Create purchase entry --> grnInvoiceNo
      const pharmacyId = await organisationModel.getPharmacyId(connection, data.orgId);
      const totalResults = await purchaseEntryModel.getPurchaseEntryCount(connection, month, year, data.orgId);
      const grnInvoiceNo = `${pharmacyId[0].org_id_main}GRN${returnDate}${totalResults[0].total_rows + 1}`;

      // Create purchase entry items
      const purchaseItems = data.purchaseItems;

      // Determine GST type based on vendor's GSTIN and organization's GSTIN
      const gstType = await distributorService.getGSTType(data.vendorId, data.orgId);

      // Variables to store aggregate totals
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      const lessDiscountPercent = (parseFloat(data.lessDiscount) / parseFloat(data.totalGross)) * 100;

      // First loop for calculating GST
      purchaseItems.forEach((item) => {
        // Calculate item totals
        const itemTotal = (item.quantity - item.free) * item.ptr * (1 - item.bulkDiscount / 100) * (1 - (lessDiscountPercent / 100));

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

      // Create purchase entry with calculated totals
      const purchaseEntryData = {
        vendorId: data.vendorId,
        orgId: data.orgId,
        vendorInvoice: data.vendorInvoice,
        invoiceDate: data.invoiceDate,
        paymentMethod: data.paymentMethod,
        creditPeriod: data.creditPeriod,
        totalGross: parseFloat(data.totalGross),
        lessDiscount: parseFloat(data.lessDiscount),
        creditDebit: parseFloat(data.creditDebit),
        totalCgst: parseFloat(totalCgstRounded),
        totalSgst: parseFloat(totalSgstRounded),
        totalIgst: parseFloat(totalIgstRounded),
      };

      // Create purchase entry
      await purchaseEntryModel.createPurchaseEntry(connection, purchaseEntryData, grnInvoiceNo);

      await Promise.all(
        purchaseItems.map(async (item) => {
          const productData = {
            productId: item.productId,
            medName: item.medName,
            mfdMkt: item.mfdMkt,
            salt: item.salt,
          };
          const inventoryData = {
            inventoryId: item.inventoryId,
            categoryId: item.categoryId,
            primaryUnit: item.primaryUnit,
            secondaryUnit: item.secondaryUnit,
            hsn: item.hsn,
            gst: item.gst,
            threshold: item.threshold,
          };
          const batchData = {
            grnId: grnInvoiceNo,
            vendorId: data.vendorId,
            batchName: item.batchName,
            expDate: item.expDate,
            conversion: item.conversion,
            shelfLabel: item.shelfLabel,
            mrp: item.mrp,
            ptr: item.ptr,
            quantity: item.quantity,
            free: item.free,
            bulkDiscount: item.bulkDiscount,
            basePrice: item.basePrice,
          };

          if (!productData.productId) {
            // eslint-disable-next-line max-len
            const productId = await productMasterModel.createProductMYSQL(connection, productData, data.orgId);
            await productMasterModel.createProductES(productData, productId, data.orgId);
            productData.productId = productId;
          }

          if (!inventoryData.inventoryId) {
            // eslint-disable-next-line max-len
            const inventoryId = await inventoryModel.createInventory(connection, inventoryData, productData.productId, data.orgId);
            inventoryData.inventoryId = inventoryId;
          }

          await Promise.all([
            // eslint-disable-next-line max-len
            batchModel.createBatch(connection, batchData, productData.productId, inventoryData.inventoryId, data.orgId),
            // eslint-disable-next-line max-len
            purchaseEntryItemModel.createPurchaseEntryItem(connection, item, productData.productId, grnInvoiceNo),
          ]);
        }),
      );

      return grnInvoiceNo;
    });
  },

  getTotalPurchaseAmount: async (orgId) => {
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
      return purchaseEntryModel.getTotalPurchaseAmount(connection, orgId, startDate, endDate);
    });
  },

  getTotalPurchaseEntries: async (orgId) => {
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
      return purchaseEntryModel.getTotalPurchaseEntries(connection, orgId, startDate, endDate);
    });
  },

  getFilteredPurchaseEntries: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return purchaseEntryModel.getPurchaseEntriesBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
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
        return purchaseEntryModel.getPurchaseEntryForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return purchaseEntryModel.getPurchaseEntryForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return purchaseEntryModel.getPurchaseEntryForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });
  },
};
