module.exports = {
  createCreditNote: async (connection, data, creditInvoiceNo) => {
    const [results] = await connection.query(
      `insert into credit_note(
                credit_invoice_id,
                vendor_id,
                org_id,
                credit_amt,
                less_discount,
                total_sgst,
                total_cgst,
                total_igst)
                value(?,?,?,?,?,?,?,?)`,
      [
        creditInvoiceNo,
        data.vendorId,
        data.orgId,
        data.creditAmt,
        data.lessDiscount,
        data.totalSgst,
        data.totalCgst,
        data.totalIgst,
      ],
    );
    return results.affectedRows;
  },

  getCreditCount: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT COUNT(*) as total_rows FROM credit_note cn
      WHERE SUBSTRING(credit_invoice_id, 20, 4) = ${month}${year} and cn.org_id = ?`,
      [orgId],
    );
    return results;
  },

  getCreditNoteById: async (connection, creditNoteId) => {
    const [results] = await connection.query(
      `SELECT * FROM credit_note
      WHERE credit_invoice_id = ?`,
      [creditNoteId],
    );
    return results;
  },

  getCreditNoteForMonth: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT DISTINCT * FROM credit_note cn
      Join vendor on vendor.vendor_id = cn.vendor_id
      where MONTH(cn.created_date_credit) = ? AND YEAR(cn.created_date_credit) = ? and cn.org_id = ?
      order by cn.created_date_credit DESC
      `,
      [
        month,
        year,
        orgId,
      ],
    );
    return results;
  },

  getCreditNoteForQuarter: async (connection, quarterStart, quarterEnd, year, orgId) => {
    const [results] = await connection.query(
      `SELECT DISTINCT * FROM credit_note cn
      Join vendor on vendor.vendor_id = cn.vendor_id
      where MONTH(cn.created_date_credit)>= ? and MONTH(cn.created_date_credit)<= ? AND YEAR(cn.created_date_credit) = ? and cn.org_id = ? 
      order by cn.created_date_credit DESC
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

  getCreditNoteForYear: async (connection, year, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM credit_note cn
      JOIN vendor on vendor.vendor_id = cn.vendor_id
      where YEAR(cn.created_date_credit) = ? and cn.org_id = ?
      order by cn.created_date_credit DESC
      `,
      [
        year,
        orgId,
      ],
    );
    return results;
  },

  getCreditNotesBetweenDates: async (connection, startDate, endDate, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM credit_note cn
      JOIN vendor ON vendor.vendor_id = cn.vendor_id
      WHERE cn.created_date_credit >= ? AND cn.created_date_credit < ? and cn.org_id = ?
      order by cn.created_date_credit DESC
      `,
      [
        startDate,
        endDate,
        orgId,
      ],
    );
    return results;
  },
};
