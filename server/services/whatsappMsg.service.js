/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const { getPool } = require('../config/database');

module.exports = {
  getOrderDetails: (salesId, orgId, callback) => {
    getPool().query(
      `select * from order_details od 
            inner join customer_data cd 
            on od.customer_id = cd.customer_id
            where od.si_invoice_id=? and cd.org_id = ?`,
      [salesId,
        orgId],
      (error, results) => {
        if (error) return callback(error);

        return callback(null, results);
      },
    );
  },

  getOrgDetails: (orgId, callback) => {
    getPool().query(
      'select org_name, org_telephone from organisation where org_id = ?',
      [orgId],
      (error, results) => {
        if (error) return callback(error);

        return callback(null, results);
      },
    );
  },
};
