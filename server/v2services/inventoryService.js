/* eslint-disable arrow-body-style */
const axios = require('axios');
const { executeTransaction } = require('../utils/transaction.util');
const batchModel = require('../v2models/batchModel');
const categoryModel = require('../v2models/categoryModel');
const hsnGstModel = require('../v2models/hsnGstModel');
const inventoryModel = require('../v2models/inventoryModel');
const productMasterModel = require('../v2models/productMasterModel');
const expiryInventoryRepository = require('../v2repositories/expiryInventoryRepository');
const saltAlternativeRepository = require('../v2repositories/saltAlternativeRepository');
require('dotenv').config();

module.exports = {
  createBatch: async (batchData) => {
    return executeTransaction(async (connection) => {
      // eslint-disable-next-line max-len
      return batchModel.createBatch(connection, batchData, batchData.productId, batchData.inventoryId, batchData.orgId);
    });
  },

  deleteBatch: async (batchId) => {
    return executeTransaction(async (connection) => {
      return batchModel.deleteBatch(connection, batchId);
    });
  },

  updateInventory: async (data, productId, orgId) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.updateInventory(connection, data, productId, orgId);
    });
  },

  deleteInventory: async (inventoryId) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.deleteInventory(connection, inventoryId);
    });
  },

  checkInventoryById: async (productId, orgId) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.checkInventoryById(connection, productId, orgId);
    });
  },

  searchInventoryProduct: async (orgId, search) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.searchInventoryProduct(connection, orgId, search);
    });
  },

  getHsnSuggestion: async (query) => {
    return executeTransaction(async (connection) => {
      return hsnGstModel.searchHSN(connection, query);
    });
  },

  getAllCategory: async () => {
    return executeTransaction(async (connection) => {
      return categoryModel.getAllCategory(connection);
    });
  },

  getCategoryById: async (categoryId) => {
    return executeTransaction(async (connection) => {
      return categoryModel.getCategoryById(connection, categoryId);
    });
  },

  getProductInventory: async (orgId, productId) => {
    return executeTransaction(async (connection) => {
      const results = await inventoryModel.getProductInventoryByOrgId(connection, productId, orgId);

      if (results.length === 0) {
        throw new Error('Product inventory not found');
      }
      // eslint-disable-next-line max-len
      const batches = await batchModel.getBatchesByInventoryId(connection, results[0].inventory_id);
      return {
        ...results[0],
        batches,
      };
    });
  },

  getInventory: async (orgId) => {
    return executeTransaction(async (connection) => {
      const results = await inventoryModel.getInventoryByOrgId(connection, orgId);
      return results;
    });
  },

  getBatchesByInventoryId: async (inventoryId) => {
    return executeTransaction(async (connection) => {
      return batchModel.getBatchesByInventoryId(connection, inventoryId);
    });
  },

  getBatchesByProductId: async (orgId, productId) => {
    return executeTransaction(async (connection) => {
      return batchModel.getBatchesByProductId(connection, orgId, productId);
    });
  },

  getBatchByBatchId: async (batchId) => {
    return executeTransaction(async (connection) => {
      return batchModel.getBatchByBatchId(connection, batchId);
    });
  },

  getNearExpiryProducts: async (orgId, filter) => {
    return executeTransaction(async (connection) => {
      let fromDate;
      let toDate;

      if (filter === 'next3Month') {
        fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() + 1);
        fromDate.setDate(1);

        toDate = new Date();
        toDate.setMonth(fromDate.getMonth() + 3);
        toDate.setDate(1);
        toDate.setDate(toDate.getDate() - 1);
      } else if (filter === 'last3Month') {
        fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 3);
        fromDate.setDate(1);

        toDate = new Date();
        toDate.setMonth(toDate.getMonth() - 1);
        toDate.setDate(1);
        toDate.setDate(toDate.getDate() - 1);
      } else if (filter === 'thisMonth') {
        fromDate = new Date();
        fromDate.setDate(1);

        toDate = new Date();
        toDate.setMonth(fromDate.getMonth() + 1);
        toDate.setDate(1);
        toDate.setDate(toDate.getDate() - 1);
      }

      // eslint-disable-next-line max-len
      const results = await expiryInventoryRepository.getNearExpiryProducts(connection, orgId, fromDate, toDate);
      return results;
    });
  },

  onboardProductInventory: async (data, orgId) => {
    return executeTransaction(async (connection) => {
      const productData = data.productData;
      const inventoryData = data.inventoryData;
      const batchData = data.batchData;

      if (!productData || !inventoryData || !batchData) {
        throw new Error('Invalid data');
      }

      if (!productData.productId) {
        // eslint-disable-next-line max-len
        const productId = await productMasterModel.createProductMYSQL(connection, productData, orgId);
        await productMasterModel.createProductES(productData, productId, orgId);
        productData.productId = productId;
      }

      if (!inventoryData.inventoryId) {
        // eslint-disable-next-line max-len
        const inventoryId = await inventoryModel.createInventory(connection, inventoryData, productData.productId, orgId);
        inventoryData.inventoryId = inventoryId;
      }

      // eslint-disable-next-line max-len
      await batchModel.createBatch(connection, batchData, productData.productId, inventoryData.inventoryId, orgId);
    });
  },

  getSaltAlternatives: async (orgId, productId) => {
    return executeTransaction(async (connection) => {
      try {
        const apiUrl = `http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/recommend-from-inventory?orgId=${orgId}&productId=${productId}`;

        // Make a GET request to the Flask API
        const response = await axios.get(apiUrl);

        const results = [];

        const recommendations = response.data.recommendations;
        console.log('Salt alternatives:', recommendations);

        recommendations.forEach(async (recommendation) => {
          const recommendedProductId = recommendation.product_id;
          // eslint-disable-next-line max-len
          const productDetails = await saltAlternativeRepository.getNearExpiryBatch(connection, orgId, recommendedProductId);
          results.push(productDetails[0]);
        });

        return results;
      } catch (error) {
        console.error('Error fetching salt alternatives:', error);
        throw error;
      }
    });
  },

  addCustomCSVProduct: async (data, orgId) => {
    return executeTransaction(async (connection) => {
      const productData = data.productData;

      if (!productData) {
        throw new Error('Invalid data');
      }
      const productId = await productMasterModel.createProductMYSQL(connection, productData, orgId);
      await productMasterModel.createProductES(productData, productId, orgId);
      return productId;
    });
  },
};
