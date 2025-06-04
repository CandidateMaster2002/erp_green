module.exports = {

  createInventory: async (connection, data, productId, orgId) => {
    const [results] = await connection.query(
      `insert into inventory(
                product_id,
                org_id,
                category_id,
                primary_unit,
                secondary_unit,
                hsn,
                gst, 
                threshold)
                values(?,?,?,?,?,?,?,?)`,
      [
        productId,
        orgId,
        data.categoryId,
        data.primaryUnit,
        data.secondaryUnit,
        data.hsn,
        data.gst,
        data.threshold,
      ],
    );
    return results.insertId;
  },

  updateInventory: async (connection, data, productId, orgId) => {
    const [results] = await connection.query(
      `update inventory set
            category_id = ?,
            hsn =?,
            gst=?, 
            threshold=?,
            primary_unit = ?,
            secondary_unit = ? 
            where product_id = ? and org_id =?`,
      [
        data.categoryId,
        data.hsn,
        data.gst,
        data.threshold,
        data.primaryUnit,
        data.secondaryUnit,
        productId,
        orgId,
      ],
    );
    return results.affectedRows;
  },

  deleteInventory: async (connection, inventoryId) => {
    const [results] = await connection.query(
      'delete from inventory where inventory_id = ?',
      [inventoryId],
    );
    return results.affectedRows;
  },

  checkInventoryById: async (connection, productId, orgId) => {
    const [results] = await connection.query(
      'select * from inventory where product_id = ? and org_id = ?',
      [productId, orgId],
    );
    return results;
  },

  searchInventoryProduct: async (connection, orgId, search) => {
    const [results] = await connection.query(
      `select * from inventory inv
            JOIN sample spl ON spl.product_id = inv.product_id
            where inv.org_id = ? and spl.med_name like ? `,
      [orgId, `%${search}%`],
    );
    return results;
  },

  getProductInventoryByOrgId: async (connection, productId, orgId) => {
    const [results] = await connection.query(
      `select * from inventory inv
            JOIN sample spl ON spl.product_id = inv.product_id
            LEFT JOIN category cat on cat.category_id = inv.category_id
            where spl.product_id = ? and inv.org_id = ? `,
      [productId, orgId],
    );
    return results;
  },

  getInventoryByOrgId: async (connection, orgId) => {
    const [results] = await connection.query(
      `SELECT inv.product_id, inv.inventory_id, inv.hsn, inv.primary_unit, inv.secondary_unit, inv.threshold, spl.*, COALESCE(SUM(bth.batch_qty-bth.saled_pri_qty), 0) AS batch_qty
        FROM inventory AS inv
        JOIN sample AS spl ON inv.product_id = spl.product_id
        LEFT JOIN batch AS bth ON inv.product_id = bth.product_id
        where inv.org_id = ? and bth.org_id = ?
        GROUP BY inv.product_id, inv.inventory_id, inv.hsn, inv.primary_unit, inv.secondary_unit, inv.threshold
        `,
      [orgId, orgId],
    );
    return results;
  },
};
