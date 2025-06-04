const { getPool } = require('../config/database');

module.exports = {

  getAll: (orgID, callBack) => {
    getPool().query(
      `SELECT grn.grn_id, grn.vendor_invoice , 
           grn.created_date_grn, grn.status, grn.paid , grn.total FROM grn 
          WHERE grn.org_id = ${orgID}
          ORDER BY created_date_grn DESC`,

      [],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },

    );
  },

  updateStatus: (data, callBack) => {
    console.log(data);
    getPool().query(
      `update grn set
                status = ?,
                paid = ?
                where grn_id = ?`,
      [
        data.status,
        data.paid,
        data.grn_id,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

};
