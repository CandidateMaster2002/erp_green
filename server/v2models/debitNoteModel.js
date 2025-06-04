module.exports = {
  createDebitNote: async (connection, data, debitInvoiceNo) => {
    const [results] = await connection.query(
      `insert into debit_note(
                debit_invoice_id,
                vendor_id,
                org_id, 
                debit_amt, 
                less_discount,
                total_sgst,
                total_cgst,
                total_igst)
                value(?,?,?,?,?,?,?,?)`,
      [
        debitInvoiceNo,
        data.vendorId,
        data.orgId,
        data.debitAmt,
        data.lessDiscount,
        data.totalSgst,
        data.totalCgst,
        data.totalIgst,
      ],
    );
    return results.affectedRows;
  },

  getDebitNoteCount: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT COUNT(*) as total_rows FROM debit_note dn
      WHERE SUBSTRING(debit_invoice_id, 20, 4) = ${month}${year} and dn.org_id = ?`,
      [orgId],
    );
    return results;
  },

  getDebitNoteById: async (connection, debitNoteId) => {
    const [results] = await connection.query(
      'SELECT * FROM debit_note WHERE debit_invoice_id = ?',
      [debitNoteId],
    );
    return results;
  },

  getDebitNoteForMonth: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT dn.*, vendor.vendor_name FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      where MONTH(dn.created_date) = ? AND YEAR(dn.created_date) = ? and dn.org_id = ?
      order by dn.created_date DESC
      `,
      [month, year, orgId],
    );
    return results;
  },

  getDebitNoteForQuarter: async (
    connection,
    quarterStart,
    quarterEnd,
    year,
    orgId,
  ) => {
    const [results] = await connection.query(
      `SELECT dn.*, vendor.vendor_name FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      where MONTH(dn.created_date)>= ? and MONTH(dn.created_date)<= ? AND YEAR(dn.created_date) = ? and dn.org_id = ? 
      order by dn.created_date DESC
      `,
      [quarterStart, quarterEnd, year, orgId],
    );
    return results;
  },

  getDebitNoteForYear: async (connection, year, orgId) => {
    const [results] = await connection.query(
      `SELECT dn.*, vendor.vendor_name FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      where YEAR(dn.created_date) = ? and dn.org_id = ?
      order by dn.created_date DESC
      `,
      [year, orgId],
    );
    return results;
  },

  getDebitNotesBetweenDates: async (connection, startDate, endDate, orgId) => {
    const [results] = await connection.query(
      `SELECT dn.*, vendor.vendor_name FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      WHERE dn.created_date >= ? AND dn.created_date < ? and dn.org_id = ?
      order by dn.created_date DESC
      `,
      [startDate, endDate, orgId],
    );
    return results;
  },
};
