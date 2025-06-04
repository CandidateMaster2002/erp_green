module.exports = {
  createSaleEntryItem: async (connection, data, saleInvoiceNo, orderId) => {
    const [results] = await connection.query(
      `insert into cart_item(product_id, saled_pri_qty_cart, saled_sec_qty_cart, main_invoice_id, order_id, batch_id, unit_discount, saled_mrp, product_name, batch_name, hsn, exp_date, gst, unit_mrp, conversion)
            values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.productId,
        data.saledPriQty,
        data.saledSecQty === '' ? 0 : data.saledSecQty,
        saleInvoiceNo,
        orderId,
        data.batchId,
        data.unitDiscount === '' ? 0 : data.unitDiscount,
        data.totalMrp,
        data.productName,
        data.batchName,
        data.hsn,
        data.expDate,
        data.gst,
        data.unitMrp,
        data.conversion,
      ],

    );
    return results.insertId;
  },

  getSaleEntryItemsByOrderId: async (connection, orderId) => {
    const [results] = await connection.query(
      'select * from cart_item where order_id = ?',
      [orderId],
    );
    return results;
  },
};
