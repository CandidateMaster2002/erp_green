const { getPool } = require('../config/database');

module.exports = {
  create: (data, callback) => {
    getPool().query(
      `insert into return_cart_item(return_id, product_id, return_pri_qty, return_sec_qty, main_invoice_id, return_invoice_id, batch_id, return_dis, return_total, product_name, batch_name, hsn, exp_date, gst, return_mrp, conversion)
            values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.return_id,
        data.product_id,
        data.return_pri_qty === '' ? 0 : data.return_pri_qty,
        data.return_sec_qty === '' ? 0 : data.return_sec_qty,
        data.main_invoice_id,
        data.return_invoice_id,
        data.batch_id,
        data.return_dis === '' ? 0 : data.return_dis,
        data.return_total,
        data.product_name,
        data.batch_name,
        data.hsn,
        data.exp_date,
        data.gst,
        data.return_mrp,
        data.conversion,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  fetchReturnCartItems: (returnId, callback) => {
    getPool().query(
      `SELECT * FROM return_cart_item 
      WHERE return_id = ?`,
      [returnId],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },
};
