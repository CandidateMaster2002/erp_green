/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const distributorMasterModel = require('../v2models/distributorMasterModel');
const organisationModel = require('../v2models/organisationModel');

module.exports = {
  createDistributor: async (data) => {
    return executeTransaction(async (connection) => {
      return distributorMasterModel.createDistributor(connection, data);
    });
  },

  updateDistributor: async (data, distributorId) => {
    return executeTransaction(async (connection) => {
      return distributorMasterModel.updateDistributor(connection, data, distributorId);
    });
  },

  deleteDistributor: async (distributorId) => {
    return executeTransaction(async (connection) => {
      return distributorMasterModel.deleteDistributor(connection, distributorId);
    });
  },

  getAllDistributorsById: async (orgId) => {
    return executeTransaction(async (connection) => {
      return distributorMasterModel.getAllDistributorsById(connection, orgId);
    });
  },

  getDistributorById: async (distributorId) => {
    return executeTransaction(async (connection) => {
      return distributorMasterModel.getDistributorById(connection, distributorId);
    });
  },

  checkGstinByOrgId: async (orgId, gstin) => {
    return executeTransaction(async (connection) => {
      return distributorMasterModel.checkGstinByOrgId(connection, orgId, gstin);
    });
  },

  getGSTType: async (vendorId, orgId) => {
    return executeTransaction(async (connection) => {
      const vendorGstin = await distributorMasterModel.getDistributorGSTIN(connection, vendorId);
      const orgGstin = await organisationModel.getOrgGSTIN(connection, orgId);

      // If orgGstin is null, return 'intra'
      if (!orgGstin.org_gstin) {
        return 'intra';
      }

      const vendorStateCode = vendorGstin.vendor_gstin.substring(0, 2);
      const orgStateCode = orgGstin.org_gstin.substring(0, 2);

      if (vendorStateCode === orgStateCode) {
        return 'intra';
      }
      return 'inter';
    });
  },
};
