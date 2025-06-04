module.exports = {
  createPurchaseOrderItem: async (connection, data, purchaseOrderNo) => {
    const [results] = await connection.query(
      `insert into po_items(po_id_main, product_id, quantity, unit, ptr, amount, mrp)
        values(?,?,?,?,?,?,?)`,
      [
        purchaseOrderNo,
        data.productId,
        data.quantity,
        data.unit,
        data.ptr,
        data.amount,
        data.mrp,
      ],
    );
    return results.affectedRows;
  },

  getPurchaseOrderItemsById: async (connection, poIdMain) => {
    const [results] = await connection.query(
      `SELECT sample.med_name, sample.mfd_mkt, po_items.* FROM po_items
      JOIN sample ON po_items.product_id = sample.product_id
      WHERE po_id_main = ?`,
      [poIdMain],
    );
    return results;
  },
};
