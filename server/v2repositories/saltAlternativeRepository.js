module.exports = {
  getNearExpiryBatch: async (connection, orgId, productId) => {
    const [results] = await connection.query(
      `SELECT 
        inv.*, bth.*, p.*,
        ((bth.batch_qty - bth.saled_pri_qty) * bth.conversion - bth.saled_sec_qty) DIV bth.conversion AS remPriQty, 
        ((bth.batch_qty - bth.saled_pri_qty) * bth.conversion - bth.saled_sec_qty) MOD bth.conversion AS remSecQty,
        ((bth.mrp - bth.purchase_rate) / bth.purchase_rate) * 100 AS margin_percentage          
        FROM 
            inventory inv
        JOIN 
            batch bth ON inv.inventory_id = bth.inventory_id
        JOIN 
            sample p ON inv.product_id = p.product_id
        WHERE 
            inv.org_id = ? AND inv.product_id = ?
        HAVING
            remPriQty > 0 OR remSecQty > 0 AND bth.exp_date > CURDATE()
        ORDER BY 
            bth.exp_date ASC
        LIMIT 1`,
      [
        orgId,
        productId,
      ],
    );
    return results;
  },
};
