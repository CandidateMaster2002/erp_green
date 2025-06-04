/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
const saleReturnModel = require('../v2models/saleReturnModel');

module.exports = {
  getFilteredSaleReturns: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return saleReturnModel.getSaleReturnBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
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
        return saleReturnModel.getSaleReturnForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return saleReturnModel.getSaleReturnForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return saleReturnModel.getSaleReturnForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });
  },

};
