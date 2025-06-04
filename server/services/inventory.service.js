const { getPool } = require('../config/database');

module.exports = {

  // Create Inventory
  create: (data, callBack) => {
    getPool().query(
      `insert into inventory(
            product_id,
            org_id,
            category_id,
            primary_unit,
            secondary_unit,
            hsn,
            gst, 
            threshold
            )
            values(?,?,?,?,?,?,?,?)`,
      [
        data.product_id,
        data.org_id,
        data.category_id,
        data.primary_unit,
        data.secondary_unit,
        data.hsn,
        data.gst,
        data.threshold,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Update Inventory
  update: (data, id, callBack) => {
    getPool().query(
      `update inventory set
            category_id = ?,
            hsn =?,
            gst=?, 
            threshold=? 
            where product_id = ? and org_id =?`,
      [
        data.category_id,
        data.hsn,
        data.gst,
        data.threshold,
        id,
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

  // Delete Inventory
  delete: (inventoryId, callBack) => {
    getPool().query(
      'delete from inventory where inventory_id = ?',
      [inventoryId],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Get All Inventories by vendor ID
  getAllById: (data, callBack) => {
    getPool().query(
      'select * from inventory where vendor_id = ?',
      [data.vendor_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },

    );
  },

  // Get Inventory by batch ID
  getById: (productId, orgId, callBack) => {
    getPool().query(
      `select * from inventory inv
      JOIN sample spl ON spl.product_id = inv.product_id
      LEFT JOIN category cat on cat.category_id = inv.category_id
      where spl.product_id = ? and inv.org_id = ? `,
      [productId,
        orgId],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },

    );
  },

  getAllInventory: (orgID, callBack) => {
    getPool().query(
      `SELECT inv.product_id, inv.inventory_id, inv.hsn, inv.primary_unit, inv.secondary_unit, inv.threshold, spl.*, COALESCE(SUM(bth.batch_qty-bth.saled_pri_qty), 0) AS batch_qty
      FROM inventory AS inv
      JOIN sample AS spl ON inv.product_id = spl.product_id
      LEFT JOIN batch AS bth ON inv.product_id = bth.product_id
      where inv.org_id = ?
      GROUP BY inv.product_id, inv.inventory_id, inv.hsn, inv.primary_unit, inv.secondary_unit, inv.threshold
      `,
      [orgID],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      },
    );
  },

  // Check if product exists in Inventory
  checkById: (productId, orgId, callBack) => {
    getPool().query(
      `select * from inventory inv
      where product_id = ? and org_id =?`,
      [productId, orgId],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },

    );
  },

  getNearExpiryProducts: (orgId, currentDate, futureDate, callBack) => {
    getPool().query(
      `SELECT inv.primary_unit, inv.secondary_unit, 
      spl.med_name, 
      bth.batch_name, bth.exp_date, bth.batch_qty, bth.saled_pri_qty, bth.saled_sec_qty, bth.conversion, bth.purchase_rate
      FROM inventory AS inv
      JOIN sample AS spl ON inv.product_id = spl.product_id
      LEFT JOIN batch AS bth ON inv.product_id = bth.product_id
      WHERE inv.org_id=${orgId} AND bth.org_id=${orgId} AND bth.exp_date BETWEEN ? AND ?
      ORDER BY bth.exp_date ASC
      `,
      [currentDate, futureDate],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      },
    );
  },

  getNearExpiryForNotification: (orgId, currentDate, futureDate, callBack) => {
    getPool().query(
      `SELECT inv.primary_unit, inv.secondary_unit, 
      spl.med_name, 
      bth.batch_name, bth.exp_date, COALESCE(SUM(bth.batch_qty-bth.saled_pri_qty), 0) AS batch_qty
      FROM inventory AS inv
      JOIN sample AS spl ON inv.product_id = spl.product_id
      LEFT JOIN batch AS bth ON inv.product_id = bth.product_id
      WHERE inv.org_id=${orgId} AND bth.org_id=${orgId} AND bth.exp_date BETWEEN ? AND ?
      GROUP BY inv.product_id, inv.hsn, inv.primary_unit, inv.secondary_unit, inv.threshold, spl.med_name, bth.batch_name, bth.exp_date
      `,
      [currentDate, futureDate],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      },
    );
  },

  getOrgEmail: (orgId, callBack) => {
    getPool().query(
      'SELECT org_email FROM organisation WHERE org_id = ?',
      [orgId],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      },
    );
  },

  getAllOrgEmailOrgId: (callBack) => {
    getPool().query(
      'SELECT org_id, org_email FROM organisation',
      [],
      (error, results) => {
        if (error) return callBack(error);
        return callBack(null, results);
      },
    );
  },
};
