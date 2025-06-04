module.exports = {
  createDebitNoteItem: async (connection, data, debitInvoiceNo) => {
    const [results] = await connection.query(
      'insert into debit_note_cart_details(debit_invoice_id,product_id,batch_id_debit,pri_unit_debit,sec_unit_debit,total_debit) value(?,?,?,?,?,?)',
      [debitInvoiceNo,
        data.productId,
        data.batchId,
        data.debitPriQty,
        data.debitSecQty,
        data.totalDebit],
    );
    return results.insertId;
  },

  getDebitNoteItemsById: async (connection, debitNoteId) => {
    const [results] = await connection.query(
      `SELECT sample.med_name, bth.batch_name, bth.mrp, bth.purchase_rate, bth.conversion, bth.exp_date, inv.hsn, inv.gst, dncd.*  FROM debit_note_cart_details dncd
      JOIN batch bth ON dncd.batch_id_debit = bth.batch_id
      JOIN inventory inv ON bth.inventory_id = inv.inventory_id
      JOIN sample ON dncd.product_id = sample.product_id
      WHERE debit_invoice_id =  ?`,
      [debitNoteId],
    );
    return results;
  },
};
