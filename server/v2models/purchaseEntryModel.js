module.exports = {
  createPurchaseEntry: async (connection, data, grnInvoiceNo) => {
    const [results] = await connection.query(
      `insert into grn(
                grn_id,
                vendor_id,
                org_id,
                vendor_invoice,
                invoice_date,
                payment_method,
                credit_period,
                total,
                less_discount,
                total_sgst,
                total_cgst,
                total_igst,
                credit_debit)
                value(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        grnInvoiceNo,
        data.vendorId,
        data.orgId,
        data.vendorInvoice,
        data.invoiceDate,
        data.paymentMethod,
        data.creditPeriod,
        data.totalGross,
        data.lessDiscount,
        data.totalSgst,
        data.totalCgst,
        data.totalIgst,
        data.creditDebit,
      ],
    );
    return results.insertId;
  },

  getPurchaseEntryCount: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT COUNT(*) as total_rows FROM grn
      WHERE SUBSTRING(grn_id, 21, 4) = ${month}${year} and grn.org_id = ?`,
      [orgId],
    );
    return results;
  },

  getPurchaseEntryById: async (connection, grnId) => {
    const [results] = await connection.query(
      'SELECT * FROM grn WHERE grn_id = ?',
      [grnId],
    );
    return results;
  },

  getTotalPurchaseAmount: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      'SELECT SUM(total + total_sgst + total_cgst + total_igst - less_discount + credit_debit) as total_purchase FROM grn WHERE org_id = ? AND DATE(created_date_grn) >= ? AND DATE(created_date_grn) <= ?',
      [orgId,
        startDate,
        endDate,
      ],
    );
    return results;
  },

  getTotalPurchaseEntries: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      'SELECT COUNT(*) as row_count FROM grn WHERE org_id = ? AND DATE(created_date_grn) >= ? AND DATE(created_date_grn) <= ?',
      [orgId, startDate, endDate],
    );
    return results;
  },

  getPurchaseEntryForMonth: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT grn.*, vendor.vendor_name FROM grn 
      JOIN vendor on vendor.vendor_id = grn.vendor_id
      where MONTH(grn.created_date_grn) = ? AND YEAR(grn.created_date_grn) = ? and grn.org_id = ?
      order by grn.created_date_grn DESC
      `,
      [
        month,
        year,
        orgId,
      ],
    );
    return results;
  },

  getPurchaseEntryForQuarter: async (connection, quarterStart, quarterEnd, year, orgId) => {
    const [results] = await connection.query(
      `SELECT grn.*, vendor.vendor_name FROM grn 
      JOIN vendor ON vendor.vendor_id = grn.vendor_id
      where MONTH(grn.created_date_grn)>= ? and MONTH(grn.created_date_grn)<= ? AND YEAR(grn.created_date_grn) = ? and grn.org_id = ?
      order by grn.created_date_grn DESC
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

  getPurchaseEntryForYear: async (connection, year, orgId) => {
    const [results] = await connection.query(
      `SELECT grn.*, vendor.vendor_name FROM grn 
      JOIN vendor ON vendor.vendor_id = grn.vendor_id
      where YEAR(grn.created_date_grn) = ? and grn.org_id = ?
      order by grn.created_date_grn DESC
      `,
      [
        year,
        orgId,
      ],
    );
    return results;
  },

  getPurchaseEntriesBetweenDates: async (connection, startDate, endDate, orgId) => {
    const [results] = await connection.query(
      `SELECT grn.*, vendor.vendor_name FROM grn 
      JOIN vendor ON vendor.vendor_id = grn.vendor_id
      WHERE grn.created_date_grn >= ? AND grn.created_date_grn < ? and grn.org_id = ?
      order by grn.created_date_grn DESC
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
