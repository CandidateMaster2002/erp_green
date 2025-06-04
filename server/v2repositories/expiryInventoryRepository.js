module.exports = {
  getNearExpiryProducts: async (connection, orgId, fromDate, toDate) => {
    const [results] = await connection.query(
      `SELECT inv.primary_unit, inv.secondary_unit, 
      spl.med_name, 
      bth.batch_name, bth.exp_date, bth.batch_qty, bth.saled_pri_qty, bth.saled_sec_qty, bth.conversion, bth.purchase_rate
      FROM inventory AS inv
      JOIN sample AS spl ON inv.product_id = spl.product_id
      LEFT JOIN batch AS bth ON inv.product_id = bth.product_id
      WHERE inv.org_id=${orgId} AND bth.org_id=${orgId} AND bth.exp_date BETWEEN ? AND ?
      ORDER BY bth.exp_date ASC
      `,
      [fromDate, toDate],
    );
    return results;
  },
};
