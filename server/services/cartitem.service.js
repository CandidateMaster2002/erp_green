/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const { getPool } = require('../config/database');

module.exports = {
  create: (data, callback) => {
    getPool().query(
      `insert into cart_item(product_id, saled_pri_qty_cart, saled_sec_qty_cart, main_invoice_id, order_id, batch_id, unit_discount, saled_mrp, product_name, batch_name, hsn, exp_date, gst, unit_mrp, conversion)
        values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.product_id,
        data.saled_pri_qty,
        data.saled_sec_qty === '' ? 0 : data.saled_sec_qty,
        data.main_invoice_id,
        data.order_id,
        data.saled_batch_id,
        data.unit_discount === '' ? 0 : data.unit_discount,
        data.saled_mrp,
        data.product_name,
        data.batch_name,
        data.hsn,
        data.exp_date,
        data.gst,
        data.mrp,
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

  getOrdersById: (id, callback) => {
    getPool().query(
      'select * from cart_item where order_id =?',
      [id],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getOrders: (id, callback) => {
    getPool().query(
      `select * from cart_item ci
      JOIN sample spl
      on ci.product_id = spl.product_id
      where main_invoice_id =?`,
      [id],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  updateOrders: (data, salesInvoiceId, batchId, productId, callback) => {
    getPool().query(
      `update cart_item 
       set return_pri_qty= return_pri_qty + ${data.return_pri_qty}, 
       return_sec_qty= return_sec_qty + ${data.return_sec_qty}
       where main_invoice_id =? and product_id=? and batch_id=?`,
      [
        salesInvoiceId,
        productId,
        batchId,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  // getOrderCartInInvoice: (id, callback) => {
  //   getPool().query(
  //     `select * from cart_item ci
  //     JOIN sample spl
  //     on ci.product_id = spl.product_id
  //     JOIN inventory inv
  //     on inv.product_id = ci.product_id
  //     JOIN batch bth
  //     on ci.batch_id = bth.batch_id
  //     where order_id =?`,
  //     [id],
  //     (error, results) => {
  //       if (error) return callback(error);
  //       console.log('results', results);
  //       return callback(null, results);
  //     },
  //   );
  // },

  getCartItemsInInvoice: (id, callback) => {
    getPool().query(
      `select * from cart_item 
      where order_id =?`,
      [id],
      (error, results) => {
        if (error) return callback(error);
        console.log('results', results);
        return callback(null, results);
      },
    );
  },

  updateCartItemOnReturnCancel: (data, callback) => {
    getPool().query(
      `UPDATE cart_item SET
        return_pri_qty = return_pri_qty - ?,
        return_sec_qty = return_sec_qty - ? 
        WHERE main_invoice_id = ? AND batch_id = ?`,
      [
        data.returnPriQty,
        data.returnSecQty,
        data.mainInvoiceId,
        data.batchId,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },
};
