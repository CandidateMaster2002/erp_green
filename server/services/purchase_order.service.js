/* eslint-disable max-len */
const { getPool } = require('../config/database');

module.exports = {
  create: (data, poId, callBack) => {
    getPool().query(
      `insert into purchase_order(
                po_id_main,
                vendor_id,
                org_id
                )
                values(?,?,?)`,
      [
        poId,
        data.vendor_id,
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

  createPOCarts: (data, callback) => {
    getPool().query(
      `insert into po_items(po_id_main, product_id, quantity, unit, ptr, amount, mrp)
        values(?,?,?,?,?,?,?)`,
      [
        data.po_id_main,
        data.product_id,
        data.quantity,
        data.unit,
        data.ptr,
        data.amount,
        data.mrp,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  searchTotalPO: (month, year, callback) => {
    getPool().query(
      `SELECT COUNT(*) as total_rows FROM purchase_order WHERE SUBSTRING(po_id_main, 20, 4) = ${month}${year}`,
      [],
      (error, results) => {
        if (error) return callback(error);
        const totalCount = JSON.parse(results[0].total_rows);
        console.log(results);
        return callback(null, totalCount);
      },
    );
  },
  // Update vendor

  update: (id, data, callBack) => {
    getPool().query(
      `update vendor set
            company = ?,
            vendor_name= ?,
            vendor_address= ?,
            vendor_contact = ?,
            vendor_gstin = ?
            where vendor_id = ?`,
      [
        data.company,
        data.vendor_name,
        data.vendor_address,
        data.vendor_contact,
        data.vendor_gstin,
        id,
      ],

      (error, results) => {
        if (error) {
          return callBack(error);
        }
        console.log(results);
        return callBack(null, results[0]);
      },
    );
  },

  // Delete vendor
  delete: (data, callBack) => {
    getPool().query(
      'delete from vendor where vendor_id = ?',

      [data],

      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Get All Vendors by Org ID
  getPOReceipt: (id, callBack) => {
    getPool().query(
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      JOIN po_items poi
      on poi.po_id_main = po.po_id_main
      JOIN sample spl
      on spl.product_id = poi.product_id
      where po.po_id_main = ? `,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        console.log(results);
        return callBack(null, results);
      },

    );
  },

  // Get Vendor by vendor ID
  getById: (vendorId, callBack) => {
    getPool().query(
      'select * from vendor where vendor_id = ?',
      [vendorId],

      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      },

    );
  },

  searchMonth: (orgId, month, year, callback) => {
    getPool().query(
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      where MONTH(po.po_created_date)=? AND YEAR(po.po_created_date) = ${year} and po.org_id = ${orgId}
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
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      where MONTH(po.po_created_date)>=? and MONTH(po.po_created_date)<=? AND YEAR(po.po_created_date) = ${year} and po.org_id = ${orgId}
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
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      where YEAR(po.po_created_date)=? and po.org_id = ${orgId}
      order by MONTH(po.po_created_date) DESC
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

  searchDates: (orgId, from, to, callback) => {
    let querys;
    let datas = [];
    if (from && to) {
      const date = new Date(to);
      querys = 'WHERE po_created_date >= ? AND po_created_date < ?';
      datas = [
        from,
        new Date(date.getTime() + 86400000),
      ];
    } else if (from) {
      querys = 'WHERE po_created_date >= ?';
      datas = [from];
    } else if (to) {
      const date = new Date(to);
      querys = 'WHERE po_created_date < ?';
      datas = [new Date(date.getTime() + 86400000)];
    }

    getPool().query(
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      
      ${querys} and po.org_id = ${orgId} 
      ORDER BY po_created_date DESC`,
      datas,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  cancelPurchaseOrder: (poId, orgId, callback) => {
    getPool().query(
      'UPDATE purchase_order SET po_status = "cancelled" WHERE po_id = ? AND org_id = ?',
      [poId, orgId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
};
