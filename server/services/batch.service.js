const { getPool } = require('../config/database');

module.exports = {
  create: (data, callback) => {
    getPool().query(
      `insert into batch(batch_name, product_id, vendor_id, org_id, inventory_id, exp_date, batch_qty, purchase_rate, mrp, free, bulk_discount, base_price, shelf_label, conversion, grn_id) 
                                      values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.batch_name,
        data.product_id,
        data.vendor_id,
        data.org_id,
        data.inventory_id,
        data.exp_date,
        data.batch_qty,
        data.purchase_rate,
        data.mrp,
        data.free,
        data.bulk_discount,
        data.base_price,
        data.shelf_label,
        data.conversion,
        data.grn_id,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  deleteBatch: (id, callback) => {
    getPool().query(
      'delete from batch where batch_id =?',
      [id],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  // Need to be corrected
  getBatch: (id, orgId, callback) => {
    getPool().query(
      `select distinct * from batch 
      JOIN inventory inv ON batch.product_id =  inv.product_id
      where batch.product_id =? and batch.org_id = ${orgId} and inv.org_id = ${orgId}
      ORDER BY batch.exp_date ASC`,
      [id],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getBatchfromBatchId: (id, callback) => {
    getPool().query(
      'select * from batch where batch_id =?',
      [id],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getAllBatchesById: (orgId, id, callback) => {
    getPool().query(
      `select * from batch 
      where org_id =? and product_id =?`,
      [
        orgId,
        id,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  updateBatchWhenSale: (data, callBack) => {
    getPool().query(
      `update batch set
            sales_qty =? 
            where batch_id = ?`,
      [
        data.sales_qty,
        data.batch_id,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  retrieveBatchOnCancel: (data, callBack) => {
    getPool().query(
      `UPDATE batch SET 
        saled_pri_qty = saled_pri_qty - ?, 
        saled_sec_qty = saled_sec_qty - ? 
        WHERE batch_id = ?`,
      [
        data.saledPriQty,
        data.saledSecQty,
        data.batchId,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  retrieveBatchOnGrnCancel: (data, callback) => {
    getPool().query(
      'DELETE FROM batch WHERE grn_id = ?',
      [
        data.grnId,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  retrieveBatchOnReturnCancel: (data, callBack) => {
    getPool().query(
      `UPDATE batch SET 
        saled_pri_qty = saled_pri_qty + ?, 
        saled_sec_qty = saled_sec_qty + ? 
        WHERE batch_id = ?`,
      [
        data.returnPriQty,
        data.returnSecQty,
        data.batchId,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  retrieveBatchOnCrnCancel: (data, callback) => {
    getPool().query(
      `UPDATE batch SET
       saled_pri_qty = saled_pri_qty - ?,
       saled_sec_qty = saled_sec_qty - ?
       WHERE batch_id = ?`,
      [
        data.creditPriQty,
        data.creditSecQty,
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

  retrieveBatchOnDrnCancel: (data, callback) => {
    getPool().query(
      `UPDATE batch SET
       saled_pri_qty = saled_pri_qty - ?,
       saled_sec_qty = saled_sec_qty - ?
       WHERE batch_id = ?`,
      [
        data.debitPriQty,
        data.debitSecQty,
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

  getRemQtyafterSales: (orgId, prodId, callBack) => {
    getPool().query(
      `
      SELECT bth.batch_id, bth.batch_qty, bth.conversion, bth.batch_name, bth.shelf_label,  bth.exp_date, bth.mrp,
      coalesce(sum(cart.saled_pri_qty),0) as pri, 
        coalesce(sum(cart.saled_sec_qty),0) as sec,
        inv.primary_unit as punit,
        inv.secondary_unit as sunit
        from cart_item cart
        RIGHT JOIN batch bth ON bth.batch_id = cart.batch_id
        LEFT JOIN inventory inv ON inv.product_id = bth.product_id AND inv.org_id = bth.org_id
        where bth.org_id = ${orgId} and bth.product_id = ${prodId}
        group by bth.batch_id, punit,sunit ;
      `,
      [],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  getTotalSumfromPurchase: (orgId, callBack) => {
    getPool().query(
      `
      SELECT
       CASE months.month
          WHEN 1 THEN 'Jan'
          WHEN 2 THEN 'Feb'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Apr'
          WHEN 5 THEN 'May'
          WHEN 6 THEN 'Jun'
          WHEN 7 THEN 'Jul'
          WHEN 8 THEN 'Aug'
          WHEN 9 THEN 'Sept'
          WHEN 10 THEN 'Oct'
          WHEN 11 THEN 'Nov'
          WHEN 12 THEN 'Dec'
          END AS x,
          COALESCE(SUM(total + total_sgst + total_cgst + total_igst - less_discount + credit_debit), 0) AS total
          FROM
              (SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
              UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
              UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) AS months
          LEFT JOIN
              grn ON MONTH(grn.created_date_grn) = months.month 
          AND
              grn.org_id = ${orgId}
          GROUP BY
              months.month;
      `,
      [],
      (error, results) => {
        if (error) callBack(error);
        return callBack(null, results);
      },
    );
  },

  getPrevSaledQty: (data, callBack) => {
    getPool().query(
      'select saled_pri_qty, saled_sec_qty, conversion from batch where batch_id =? and org_id =?',
      [
        data.batch_id,
        data.org_id,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  updateBatchQtyAfterSales: (priQty, secQty, batchId, callBack) => {
    getPool().query(
      `update batch set
            saled_pri_qty =?,
            saled_sec_qty=? 
            where batch_id = ?`,
      [
        priQty,
        secQty,
        batchId,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },
  updateBatchQtyAfterReturn: (priQty, secQty, batchId, callBack) => {
    getPool().query(
      `update batch set
            saled_pri_qty =?,
            saled_sec_qty=? 
            where batch_id = ?`,
      [
        priQty,
        secQty,
        batchId,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  getTotalPurchaseAmt: (orgId, callback) => {
    getPool().query(
      `select coalesce(sum(bth.batch_qty * bth.purchase_rate),0) as total from batch as bth 
      where org_id =${orgId} and grn_id is not null`,
      [],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getOrderStatistics: (orgId, callback) => {
    getPool().query(
      `SELECT inv.primary_unit, inv.secondary_unit, sum(bth.saled_pri_qty) as pri, sum(bth.saled_sec_qty) as sec from inventory inv
      JOIN batch bth on bth.product_id = inv.product_id
      where inv.org_id = ?
      group by inv.primary_unit, inv.secondary_unit 
      ORDER BY pri DESC
      `,
      [orgId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
};
