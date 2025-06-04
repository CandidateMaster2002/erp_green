/* eslint-disable max-len */
const distributorService = require('../v2services/distributorService');

module.exports = {
  createDistributor: async (req, res) => {
    const data = req.body;
    try {
      await distributorService.createDistributor(data);
      res.status(201).json({
        success: true,
        message: 'Distributor created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  updateDistributor: async (req, res) => {
    const distributorId = req.params.id;
    const data = req.body;
    try {
      const affectedRows = await distributorService.updateDistributor(data, distributorId);
      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }
      res.status(200).json({
        success: true,
        message: 'Distributor updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  deleteDistributor: async (req, res) => {
    const distributorId = req.params.id;
    try {
      const affectedRows = await distributorService.deleteDistributor(distributorId);
      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }
      res.status(200).json({
        success: true,
        message: 'Distributor deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getAllDistributorsById: async (req, res) => {
    const orgId = req.query.org;
    try {
      const distributors = await distributorService.getAllDistributorsById(orgId);
      res.status(200).json({
        success: true,
        data: distributors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getDistributorById: async (req, res) => {
    const distributorId = req.params.id;
    try {
      const distributor = await distributorService.getDistributorById(distributorId);
      if (distributor) {
        res.status(200).json({
          success: true,
          data: distributor[0],
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Distributor not found',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
