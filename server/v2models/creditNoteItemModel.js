module.exports = {
  createCreditNoteItem: async (connection, data, creditInvoiceNo) => {
    const [results] = await connection.query(
      `insert into credit_note_cart_details(       
            credit_invoice_id,
            product_id,
            batch_id_credit,
            pri_unit_credit,
            sec_unit_credit,
            total_credit)
            value(?,?,?,?,?,?)`,
      [creditInvoiceNo,
        data.productId,
        data.batchId,
        data.creditPriQty,
        data.creditSecQty,
        data.totalCredit],
    );
    return results.insertId;
  },

  getCreditNoteItemsById: async (connection, creditNoteId) => {
    const [results] = await connection.query(
      `SELECT sample.med_name, bth.batch_name, bth.mrp, bth.purchase_rate, bth.conversion, bth.exp_date, inv.hsn, inv.gst, cncd.*  FROM credit_note_cart_details cncd
      JOIN batch bth ON cncd.batch_id_credit = bth.batch_id
      JOIN inventory inv ON bth.inventory_id = inv.inventory_id
      JOIN sample ON cncd.product_id = sample.product_id
      WHERE credit_invoice_id =  ?`,
      [creditNoteId],
    );
    return results;
  },
};
