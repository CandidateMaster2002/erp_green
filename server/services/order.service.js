/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { getPool } = require('../config/database');

const date_time = new Date();
module.exports = {

  // Create PO
  create: (data, callBack) => {
    getPool().query(
      `insert into order(
                vendor_id,
                product_id,
                org_id,
                quantity,
                status,
                exp_delivery_date)
                values(?,?,?,?,?,?)`,
      [
        data.vendor_id,
        data.product_id,
        data.org_id,
        data.quantity,
        data.status,
        data.exp_delivery_date,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Update PO
  update: (error, results) => {
    getPool().query(
      `update order set
            vendor_id = ?,
            product_id = ?,
            org_id = ?,
            quantity = ?,
            status= = ?,
            exp_delivery_date = ?
            where po_id = ?`
        [
          data.vendor_id,
          data.product_id,
          data.org_id,
          data.quantity,
          data.status,
          data.exp_delivery_date,
          data.po_id
        ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      },
    );
  },

  // Delete order by order_id
  delete: (data, callBack) => {
    getPool().query(
      'delete from purchase_order where po_id = ?',
      [data.po_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Get All orders by vendor ID
  getAllById: (data, callBack) => {
    getPool().query(
      'select * from purchase_order where vendor_id = ?',
      [data.vendor_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },

    );
  },

  // Get order by po_id
  getById: (data, callBack) => {
    getPool().query(
      'select * from purchase_order where po_id = ?',
      [data.po_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      },

    );
  },
};
