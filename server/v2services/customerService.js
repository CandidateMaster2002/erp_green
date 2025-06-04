/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const customerMasterModel = require('../v2models/customerMasterModel');

module.exports = {
  getCustomerByOrgId: async (orgId) => {
    return executeTransaction(async (connection) => {
      return customerMasterModel.getCustomerByOrgId(connection, orgId);
    });
  },
};
