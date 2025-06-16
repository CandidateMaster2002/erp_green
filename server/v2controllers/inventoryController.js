/* eslint-disable max-len */
const inventoryService = require('../v2services/inventoryService');

module.exports = {
  createBatch: async (req, res) => {
    const batchData = req.body;
    try {
      await inventoryService.createBatch(batchData);
      res.status(201).json({
        success: true,
        message: 'Batch created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  deleteBatch: async (req, res) => {
    const batchId = req.params.batchId;
    try {
      const affectedRows = await inventoryService.deleteBatch(batchId);
      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Batch not found',
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Batch deleted successfully',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  updateInventory: async (req, res) => {
    const orgId = req.query.orgId;
    const productId = req.query.productId;
    const data = req.body;
    try {
      const affectedRows = await inventoryService.updateInventory(data, productId, orgId);
      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Inventory not found',
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Inventory updated successfully',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  deleteInventory: async (req, res) => {
    const inventoryId = req.params.inventoryId;
    try {
      const affectedRows = await inventoryService.deleteInventory(inventoryId);
      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Inventory not found',
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Inventory deleted successfully',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  checkInventoryById: async (req, res) => {
    const productId = req.query.productId;
    const orgId = req.query.orgId;
    try {
      const inventoryData = await inventoryService.checkInventoryById(productId, orgId);
      if (inventoryData.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Inventory not found',
        });
      } else {
        res.status(200).json({
          success: true,
          data: inventoryData,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  searchInventoryProduct: async (req, res) => {
    const orgId = req.query.orgId;
    const search = req.query.search;
    try {
      const inventoryData = await inventoryService.searchInventoryProduct(orgId, search);
      res.status(200).json({
        success: true,
        data: inventoryData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getHsnSuggestion: async (req, res) => {
    const query = req.query.query;
    try {
      const hsnSuggestion = await inventoryService.getHsnSuggestion(query);
      res.status(200).json({
        success: true,
        data: hsnSuggestion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getProductInventory: async (req, res) => {
    const orgId = req.query.orgId;
    const productId = req.query.productId;
    try {
      const productInventory = await inventoryService.getProductInventory(orgId, productId);
      res.status(200).json({
        success: true,
        message: 'Product inventory retrieved successfully',
        data: productInventory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
  
 getPaginatedInventory: async (req, res) => {
    const orgId = req.query.orgID; // Ensure this matches your frontend query param (orgID)
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
    const offset = parseInt(req.query.offset, 10) || 0; // Default offset to 0

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'orgID is required for pagination',
      });
    }
    try {
      // Call the inventory service with pagination parameters
      const inventoryData = await inventoryService.getPaginatedInventory(orgId, limit, offset);
      // (Optional but recommended): You might also want to get the total count
      // for pagination UI (e.g., "Page 1 of 5"). We'll address this in the service layer.
      // For now, we'll just return the paginated data.
      res.status(200).json({
        success: true,
        data: inventoryData,
        // totalCount: totalCount // Will add this later from service
      });
    } catch (error) {
      console.error('Error fetching paginated inventory (V2):', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },

  getNearExpiryProducts: async (req, res) => {
    const orgId = req.params.id;
    const filter = req.params.filter;
    try {
      const nearExpiryProducts = await inventoryService.getNearExpiryProducts(orgId, filter);
      res.status(200).json({
        success: true,
        data: nearExpiryProducts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  onboardProductInventory: async (req, res) => {
    const orgId = req.query.orgId;
    const data = req.body;
    try {
      await inventoryService.onboardProductInventory(data, orgId);
      res.status(201).json({
        success: true,
        message: 'Product inventory onboarded successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getAllCategory: async (req, res) => {
    try {
      const allCategories = await inventoryService.getAllCategory();
      res.status(200).json({
        success: true,
        data: allCategories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getCategoryById: async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
      const category = await inventoryService.getCategoryById(categoryId);
      if (category.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      } else {
        res.status(200).json({
          success: true,
          data: category,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getBatchesByInventoryId: async (req, res) => {
    const inventoryId = req.params.inventoryId;
    try {
      const batches = await inventoryService.getBatchesByInventoryId(inventoryId);
      res.status(200).json({
        success: true,
        data: batches,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getBatchesByProductId: async (req, res) => {
    const orgId = req.params.orgId;
    const productId = req.params.productId;
    try {
      const batches = await inventoryService.getBatchesByProductId(orgId, productId);
      res.status(200).json({
        success: true,
        data: batches,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getBatchByBatchId: async (req, res) => {
    const batchId = req.params.batchId;
    try {
      const batch = await inventoryService.getBatchByBatchId(batchId);
      res.status(200).json({
        success: true,
        data: batch[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getSaltAlternatives: async (req, res) => {
    const orgId = req.params.orgId;
    const productId = req.params.productId;
    try {
      const saltAlternatives = await inventoryService.getSaltAlternatives(orgId, productId);
      res.status(200).json({
        success: true,
        data: saltAlternatives,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  addCustomCSVProduct: async (req, res) => {
    const orgId = req.query.orgId;
    const data = req.body;
    try {
      const productId = await inventoryService.addCustomCSVProduct(data, orgId);
      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        data: productId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding product',
        error: error.message,
      });
    }
  },
};
