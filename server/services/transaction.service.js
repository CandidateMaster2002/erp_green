const { getPool } = require('../config/database');

module.exports = {
  getBalance: (data, callBack) => {
    getPool().query(
      `SELECT transaction_id, balance_amt FROM transactions
        WHERE org_id = ? AND vendor_id = ? AND balance_amt > 0 AND transaction_type = 'credit'
        ORDER BY created_at ASC
        LIMIT 1`,
      [data.org_id, data.vendor_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  updateBalance: (data, callBack) => {
    getPool().query(
      `UPDATE transactions
      SET balance_amt = balance_amt - ?
      WHERE transaction_id = ?`,
      [data.deduction, data.transaction_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },
};
