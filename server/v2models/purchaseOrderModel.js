module.exports = {
  createPurchaseOrder: async (connection, data, purchaseOrderNo) => {
    const [results] = await connection.query(
      `insert into purchase_order(
            po_id_main,
            vendor_id,
            org_id)
            values(?,?,?)`,
      [
        purchaseOrderNo,
        data.vendorId,
        data.orgId,
      ],
    );
    return results.insertId;
  },

  getPurchaseOrderCount: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT COUNT(*) as total_rows FROM purchase_order po
      WHERE SUBSTRING(po_id_main, 20, 4) = ${month}${year} and po.org_id = ?`,
      [orgId],
    );
    return results;
  },

  getPurchaseOrderById: async (connection, poId) => {
    const [results] = await connection.query(
      `SELECT * FROM purchase_order
      WHERE po_id_main = ?`,
      [poId],
    );
    return results;
  },

  getPurchaseOrderForMonth: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      WHERE MONTH(po.po_created_date)= ? AND YEAR(po.po_created_date) = ? and po.org_id = ?
      order by po.po_created_date DESC
      `,
      [
        month,
        year,
        orgId,
      ],
    );
    return results;
  },

  getPurchaseOrderForQuarter: async (connection, quarterStart, quarterEnd, year, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      where MONTH(po.po_created_date)>=? and MONTH(po.po_created_date)<=? AND YEAR(po.po_created_date) = ? and po.org_id = ?
      order by po.po_created_date DESC
      `,
      [
        quarterStart,
        quarterEnd,
        year,
        orgId,
      ],
    );
    return results;
  },

  getPurchaseOrderForYear: async (connection, year, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      where YEAR(po.po_created_date)=? and po.org_id = ?
      order by po.po_created_date DESC
      `,
      [
        year,
        orgId,
      ],
    );
    return results;
  },

  getPurchaseOrdersBetweenDates: async (connection, startDate, endDate, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM purchase_order po
      JOIN vendor
      ON vendor.vendor_id = po.vendor_id
      WHERE po.po_created_date >= ? AND po.po_created_date < ? and po.org_id = ?
      ORDER BY po.po_created_date DESC`,
      [
        startDate,
        endDate,
        orgId,
      ],
    );
    return results;
  },

};
