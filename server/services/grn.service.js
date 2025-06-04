const { getPool } = require('../config/database');

module.exports = {
  // Create Credit Note
  createGRN: (data, GRN, callBack) => {
    getPool().query(
      `insert into grn(
                  grn_id,
                  vendor_id,
                  vendor_invoice,
                  total,
                  invoice_date,
                  credit_period,
                  less_discount,
                  credit_debit,
                  payment_method,
                  org_id)
                  value(?,?,?,?,?,?,?,?,?,?)`,
      [
        GRN,
        data.vendor_id,
        data.vendor_invoice,
        data.total,
        data.invoice_date,
        data.credit_period,
        data.less_discount,
        data.credit_debit,
        data.payment_method,
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

  getTotalGRN: (callback) => {
    getPool().query(
      'SELECT COUNT(*) as total_rows FROM grn',
      [],
      (error, results) => {
        if (error) return callback(error);
        const totalCount = JSON.parse(results[0].total_rows);
        return callback(null, totalCount);
      },
    );
  },

  createGRNcarts: (data, callback) => {
    getPool().query(

      `insert into grn_cart_details(grn_id, product_id, gst, hsn, punit, sunit, moq, batch_name, exp_Date, conversion, shelf_label, mrp, purchase, qty, free, bulk_discount, base_price)
        values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.grn_id,
        data.product_id,
        data.gst,
        data.hsn,
        data.punit,
        data.sunit,
        data.moq,
        data.batch_name,
        data.exp,
        data.conversion,
        data.shelf_label,
        data.mrp,
        data.purchase,
        data.qty,
        data.free,
        data.bulk_discount,
        data.base_price,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  searchDates: (orgId, from, to, callback) => {
    let querys;
    let datas = [];
    if (from && to) {
      const date = new Date(to);
      querys = 'WHERE grn.created_date_grn >= ? AND grn.created_date_grn < ?';
      datas = [
        from,
        new Date(date.getTime() + 86400000),
      ];
    } else if (from) {
      querys = 'WHERE grn.created_date_grn >= ?';
      datas = [from];
    } else if (to) {
      const date = new Date(to);
      querys = 'WHERE grn.created_date_grn < ?';
      datas = [new Date(date.getTime() + 86400000)];
    }

    getPool().query(
      `SELECT grn.*, vendor.vendor_name
      FROM grn 
      JOIN vendor ON vendor.vendor_id = grn.vendor_id
      ${querys} and grn.org_id = ${orgId} 
      ORDER BY created_date_grn DESC`,
      datas,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchMonth: (orgId, month, year, callback) => {
    getPool().query(
      `SELECT grn.*, vendor.vendor_name
      FROM grn 
      JOIN vendor on vendor.vendor_id = grn.vendor_id
      where MONTH(grn.created_date_grn)=? AND YEAR(grn.created_date_grn) = ${year} and grn.org_id = ${orgId} 
      `,
      [
        month,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchQuarter: (orgId, start, end, year, callback) => {
    getPool().query(
      `SELECT grn.*, vendor.vendor_name
      FROM grn 
      JOIN vendor ON vendor.vendor_id = grn.vendor_id
      where MONTH(grn.created_date_grn)>=? and MONTH(grn.created_date_grn)<=? AND YEAR(grn.created_date_grn) = ${year} and grn.org_id = ${orgId} 
      `,
      [
        start,
        end,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchYear: (orgId, year, callback) => {
    getPool().query(
      `SELECT grn.*, vendor.vendor_name
      FROM grn 
      JOIN vendor ON vendor.vendor_id = grn.vendor_id
      where YEAR(grn.created_date_grn)=? and grn.org_id = ${orgId} 
      order by MONTH(grn.created_date_grn) DESC
      `,
      [
        year,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },

    );
  },

  getGRNreceipt: (id, callback) => {
    getPool().query(
      `SELECT sample.med_name, grncd.*, vendor.*, grn.vendor_invoice, grn.total, grn.paid, grn.invoice_date, grn.credit_period, grn.less_discount, grn.payment_method, grn.credit_debit, grn.status FROM grn
      Join grn_cart_details grncd on grncd.grn_id = grn.grn_id
      Join vendor on vendor.vendor_id = grn.vendor_id
      Join sample on grncd.product_id = sample.product_id
      where grn.grn_id = ?
      `,
      [id],
      (error, results) => {
        if (error) return callback(error);

        return callback(null, results);
      },
    );
  },

  getGrnById: (grnId, callback) => {
    getPool().query(
      `SELECT * FROM grn 
       WHERE grn_id = ?`,
      [grnId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results[0]);
      },
    );
  },

  getGrnCartItemsById: (grnId, callback) => {
    getPool().query(
      `SELECT * FROM grn_cart_details 
       WHERE grn_id = ?`,
      [grnId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  cancelGRN: (grnId, callback) => {
    getPool().query(
      'UPDATE grn SET status = "cancelled" WHERE grn_id = ?',
      [grnId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getTotalPurchaseBills: (orgId, callback) => {
    getPool().query(
      `SELECT COUNT(*) AS row_count FROM grn
      WHERE org_id = ?`,
      [orgId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

};
