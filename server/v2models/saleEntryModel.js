module.exports = {
  createSaleEntry: async (connection, data, saleInvoiceNo, customerId) => {
    const [results] = await connection.query(
      `insert into order_details(org_id, customer_id, invoice_id_main, subtotal, total_dist, grand_total, mop, doctor_name) 
            values(?,?,?,?,?,?,?,?)`,
      [
        data.orgId,
        customerId,
        saleInvoiceNo,
        data.subTotal,
        data.totalDiscount,
        data.grandTotal,
        data.paymentMethod,
        data.doctorName,
      ],

    );
    return results.insertId;
  },

  getSaleEntryCount: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT COUNT(*) as total_rows FROM order_details od
        WHERE SUBSTRING(invoice_id_main, 20, 4) = ${month}${year} and od.org_id = ?
        `,
      [orgId],
    );
    return results;
  },

  getSaleEntryById: async (connection, orderId) => {
    const [results] = await connection.query(
      `SELECT * FROM order_details
        WHERE order_id = ?`,
      [orderId],
    );
    return results;
  },

  getTotalSaleAmount: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      'SELECT SUM(grand_total) as total_sale FROM order_details WHERE org_id = ? AND DATE(sales_created_date) >= ? AND DATE(sales_created_date) <= ?',
      [orgId,
        startDate,
        endDate,
      ],
    );
    return results;
  },

  getTotalSaleEntries: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      'SELECT COUNT(*) as row_count FROM order_details WHERE org_id = ? AND DATE(sales_created_date) >= ? AND DATE(sales_created_date) <= ?',
      [orgId, startDate, endDate],
    );
    return results;
  },

  getSaleEntryForMonth: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM order_details od
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      where MONTH(od.sales_created_date) = ? AND YEAR(od.sales_created_date) = ? and od.org_id = ?
      order by od.sales_created_date DESC
      `,
      [
        month,
        year,
        orgId,
      ],
    );
    return results;
  },

  getSaleEntryForQuarter: async (connection, quarterStart, quarterEnd, year, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM order_details od
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      where MONTH(od.sales_created_date)>= ? and MONTH(od.sales_created_date)<= ? AND YEAR(od.sales_created_date) = ? and od.org_id = ?
      order by od.sales_created_date DESC
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

  getSaleEntryForYear: async (connection, year, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM order_details od
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      where YEAR(od.sales_created_date) = ? and od.org_id = ?
      order by od.sales_created_date DESC
      `,
      [
        year,
        orgId,
      ],
    );
    return results;
  },

  getSaleEntriesBetweenDates: async (connection, startDate, endDate, orgId) => {
    const [results] = await connection.query(
      `SELECT * FROM order_details od
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      WHERE od.sales_created_date >= ? AND od.sales_created_date < ? and od.org_id = ?
      order by od.sales_created_date DESC
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
