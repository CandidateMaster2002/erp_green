/* eslint-disable brace-style */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const fs = require('fs');
const csvParser = require('csv-parser');
const { executeTransaction } = require('../utils/transaction.util');
const inventoryModel = require('../v2models/inventoryModel');
const batchModel = require('../v2models/batchModel');
const organisationModel = require('../v2models/organisationModel');
const purchaseEntryModel = require('../v2models/purchaseEntryModel');
const distributorService = require('./distributorService');
const purchaseEntryItemModel = require('../v2models/purchaseEntryItemModel');

module.exports = {
  parseCSV: async (filePath) => new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        results.push(data); // Push the data as is

        // Check if any value is empty (null, undefined, or empty string) - Not used currently!!!!
        // let isEmptyValueFound = false;

        // // Check each field to see if any value is empty
        // Object.entries(data).forEach(([key, value]) => {
        //   if (value === null || value === undefined || value.trim() === '') {
        //     isEmptyValueFound = true;
        //   }
        // });

        // // Only push the data if no empty values were found
        // if (!isEmptyValueFound) {
        //   results.push(data);
        // }
      })
      .on('end', () => {
        fs.unlink(filePath, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      })
      .on('error', (error) => reject(error));
  }),

  processInventoryCSVData: async (parsedCSVData, columnMapping) => {
    const columnDataTypes = {
      MRP: 'decimal',
      PTR: 'decimal',
      ExpiryDate: 'date',
      Conversion: 'integer',
      Quantity: 'integer',
      GST: 'integer',
      HSN: 'integer',
      productId: 'integer',
      ProductName: 'string',
      BatchName: 'string',
      PriUnit: 'string',
      SecUnit: 'string',
      // Category: 'string',
    };
    return parsedCSVData.map((row) => {
      return Object.entries(columnMapping).reduce(
        (mappedRow, [systemColumn, csvColumn]) => {
          if (systemColumn === 'MRP' || systemColumn === 'PTR') {
            mappedRow[systemColumn] = parseFloat(row[csvColumn]).toFixed(2);
          }
          // Handle date formatting for 'expiry date'
          else if (systemColumn === 'ExpiryDate') {
            if (/\d{2}\/\d{4}/.test(row[csvColumn])) {
              const [month, year] = row[csvColumn]
                .split('/')
                .map((part) => parseInt(part, 10));
              const lastDay = new Date(year, month, 0).getDate();
              const formattedDate = `${year}-${month
                .toString()
                .padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`; // Converts to 'yyyy-mm-dd'
              mappedRow[systemColumn] = formattedDate;
            } else {
              // Fallback for other formats or handling errors
              try {
                const date = new Date(row[csvColumn]);
                const formattedDate = date.toISOString().split('T')[0]; // Keeps 'yyyy-mm-dd' format
                mappedRow[systemColumn] = formattedDate;
              } catch (error) {
                console.error(
                  `Error processing ExpiryDate for row: ${JSON.stringify(
                    row,
                  )} - ${error.message}`,
                );
                throw error;
              }
            }
          } else {
            mappedRow[systemColumn] = row[csvColumn];
          }

          const value = mappedRow[systemColumn];
          const expectedType = columnDataTypes[systemColumn];

          // Validate data type
          let isValidType = true;
          switch (expectedType) {
            case 'decimal':
              isValidType = !Number.isNaN(parseFloat(value))
                && Number.isFinite(parseFloat(value));
              break;
            case 'integer':
              isValidType = Number.isInteger(parseFloat(value));
              break;
            case 'string':
              isValidType = typeof value === 'string';
              break;
            case 'date':
              isValidType = /^\d{4}-\d{2}-\d{2}$/.test(value); // Regular expression to match dates in yyyy-mm-dd format
              break;
            default:
              isValidType = false;
              console.error(`Unexpected data type for column ${systemColumn}`);
              break;
          }

          if (!isValidType) {
            console.error(
              `Invalid data type for column ${systemColumn} in row: ${JSON.stringify(
                mappedRow,
              )}`,
            );
            throw new Error(`Invalid data type for column ${systemColumn}`);
          }

          return mappedRow;
        },
        {},
      );
    });
  },

  processPurchaseBillCSVData: async (
    parsedCSVData,
    purchaseBillColumnMapping,
  ) => {
    const columnDataTypes = {
      MRP: 'decimal',
      PTR: 'decimal',
      DiscountPct: 'integer',
      ExpiryDate: 'date',
      Conversion: 'integer',
      Quantity: 'integer',
      Free: 'integer',
      GST: 'integer',
      HSN: 'integer',
      productId: 'integer',
      ProductName: 'string',
      BatchName: 'string',
      PriUnit: 'string',
      SecUnit: 'string',
    };
    return parsedCSVData.map((row) => {
      return Object.entries(purchaseBillColumnMapping).reduce(
        (mappedRow, [systemColumn, csvColumn]) => {
          if (systemColumn === 'MRP' || systemColumn === 'PTR') {
            mappedRow[systemColumn] = parseFloat(row[csvColumn]).toFixed(2);
          }
          // Handle date formatting for 'expiry date'
          else if (systemColumn === 'ExpiryDate') {
            if (/\d{2}\/\d{4}/.test(row[csvColumn])) {
              const [month, year] = row[csvColumn]
                .split('/')
                .map((part) => parseInt(part, 10));
              const lastDay = new Date(year, month, 0).getDate();
              const formattedDate = `${year}-${month
                .toString()
                .padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`; // Converts to 'yyyy-mm-dd'
              mappedRow[systemColumn] = formattedDate;
            } else {
              // Fallback for other formats or handling errors
              try {
                const date = new Date(row[csvColumn]);
                const formattedDate = date.toISOString().split('T')[0]; // Keeps 'yyyy-mm-dd' format
                mappedRow[systemColumn] = formattedDate;
              } catch (error) {
                console.error(
                  `Error processing ExpiryDate for row: ${JSON.stringify(
                    row,
                  )} - ${error.message}`,
                );
                throw error;
              }
            }
          } else {
            mappedRow[systemColumn] = row[csvColumn];
          }

          const value = mappedRow[systemColumn];
          const expectedType = columnDataTypes[systemColumn];

          // Validate data type
          let isValidType = true;
          switch (expectedType) {
            case 'decimal':
              isValidType = !Number.isNaN(parseFloat(value))
                && Number.isFinite(parseFloat(value));
              break;
            case 'integer':
              isValidType = Number.isInteger(parseFloat(value));
              break;
            case 'string':
              isValidType = typeof value === 'string';
              break;
            case 'date':
              isValidType = /^\d{4}-\d{2}-\d{2}$/.test(value); // Regular expression to match dates in yyyy-mm-dd format
              break;
            default:
              isValidType = false;
              console.error(`Unexpected data type for column ${systemColumn}`);
              break;
          }

          if (!isValidType) {
            console.error(
              `Invalid data type for column ${systemColumn} in row: ${JSON.stringify(
                mappedRow,
              )}`,
            );
            throw new Error(`Invalid data type for column ${systemColumn}`);
          }

          return mappedRow;
        },
        {},
      );
    });
  },

  uploadInventory: async (mappedProducts, orgId) => {
    return executeTransaction(async (connection) => {
      if (!mappedProducts) {
        throw new Error('No mapped product found');
      }
      if (!orgId) {
        throw new Error('No orgId found');
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const row of mappedProducts) {
        const { productId, ...productDetails } = row;

        const inventoryData = {
          primaryUnit: productDetails.PriUnit,
          secondaryUnit: productDetails.SecUnit,
          hsn: productDetails.HSN,
          gst: productDetails.GST,
          threshold: 2,
        };

        const batchDetails = {
          batchName: productDetails.BatchName,
          expDate: productDetails.ExpiryDate,
          quantity: productDetails.Quantity,
          ptr: productDetails.PTR,
          mrp: productDetails.MRP,
          free: 0,
          bulkDiscount: 0,
          basePrice: productDetails.PTR,
          conversion: productDetails.Conversion,
        };

        // eslint-disable-next-line no-await-in-loop
        const inventoryExists = await inventoryModel.checkInventoryById(
          connection,
          productId,
          orgId,
        );
        if (inventoryExists.length > 0) {
          const inventoryId = inventoryExists[0].inventory_id;
          await batchModel.createBatch(
            connection,
            batchDetails,
            productId,
            inventoryId,
            orgId,
          );
        } else {
          const inventoryId = await inventoryModel.createInventory(
            connection,
            inventoryData,
            productId,
            orgId,
          );
          await batchModel.createBatch(
            connection,
            batchDetails,
            productId,
            inventoryId,
            orgId,
          );
        }
      }
    });
  },

  uploadPurchaseBill: async (data, orgId) => {
    return executeTransaction(async (connection) => {
      if (!data) {
        throw new Error('Data not found');
      }
      if (!orgId) {
        throw new Error('No orgId found');
      }
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const returnDate = day + month + year;

      // Create purchase entry --> grnInvoiceNo
      const pharmacyId = await organisationModel.getPharmacyId(
        connection,
        data.orgId,
      );
      const totalResults = await purchaseEntryModel.getPurchaseEntryCount(
        connection,
        month,
        year,
        data.orgId,
      );
      const grnInvoiceNo = `${pharmacyId[0].org_id_main}GRN${returnDate}${totalResults[0].total_rows + 1
      }`;

      // Create purchase entry items
      const purchaseItems = data.purchaseItems;

      // Determine GST type based on vendor's GSTIN and organization's GSTIN
      const gstType = await distributorService.getGSTType(
        data.vendorId,
        data.orgId,
      );

      // Variables to store aggregate totals
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      const lessDiscountPercent = (parseFloat(data.lessDiscount) / parseFloat(data.totalGross)) * 100;

      // First loop for calculating GST
      purchaseItems.forEach((item) => {
        // Calculate item totals
        const itemTotal = (item.quantity)
          * item.ptr
          * (1 - item.bulkDiscount / 100)
          * (1 - lessDiscountPercent / 100);

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
          const productId = item.productId;

          const inventoryData = {
            primaryUnit: item.primaryUnit,
            secondaryUnit: item.secondaryUnit,
            hsn: item.hsn,
            gst: item.gst,
            threshold: 2,

          };
          const batchDetails = {
            grnId: grnInvoiceNo,
            vendorId: data.vendorId,
            batchName: item.batchName,
            expDate: item.expDate,
            quantity: parseFloat(item.quantity) + parseFloat(item.free),
            ptr: parseFloat(item.ptr),
            mrp: parseFloat(item.mrp),
            conversion: parseFloat(item.conversion),
            free: parseFloat(item.free) || 0,
            bulkDiscount: parseFloat(item.bulkDiscount) || 0,
            basePrice: parseFloat(item.basePrice),
          };

          console.log('batchDetails', batchDetails);

          const purchaseEntryItem = {
            gst: item.gst,
            hsn: item.hsn,
            primaryUnit: item.primaryUnit,
            secondaryUnit: item.secondaryUnit,
            threshold: item.quantity,
            batchName: item.batchName,
            expDate: item.expDate,
            conversion: parseFloat(item.conversion),
            shelfLabel: item.shelfLabel,
            quantity: parseFloat(item.quantity) + parseFloat(item.free),
            ptr: parseFloat(item.ptr),
            mrp: parseFloat(item.mrp),
            free: parseFloat(item.free) || 0,
            bulkDiscount: parseFloat(item.bulkDiscount) || 0,
            basePrice: parseFloat(item.basePrice),
          };

          // eslint-disable-next-line no-await-in-loop
          const inventoryExists = await inventoryModel.checkInventoryById(
            connection,
            productId,
            orgId,
          );
          if (inventoryExists.length > 0) {
            const inventoryId = inventoryExists[0].inventory_id;
            await batchModel.createBatch(
              connection,
              batchDetails,
              productId,
              inventoryId,
              orgId,
            );
            await purchaseEntryItemModel.createPurchaseEntryItem(
              connection,
              purchaseEntryItem,
              productId,
              grnInvoiceNo,
            );
          } else {
            const inventoryId = await inventoryModel.createInventory(
              connection,
              inventoryData,
              productId,
              orgId,
            );
            await batchModel.createBatch(
              connection,
              batchDetails,
              productId,
              inventoryId,
              orgId,
            );
            await purchaseEntryItemModel.createPurchaseEntryItem(
              connection,
              purchaseEntryItem,
              productId,
              grnInvoiceNo,
            );
          }
        }),
      );

      return grnInvoiceNo;
    });
  },
};
