/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const organisationModel = require('../v2models/organisationModel');

module.exports = {
  getOrgById: async (orgId) => {
    return executeTransaction(async (connection) => {
      return organisationModel.getOrgById(connection, orgId);
    });
  },
};
