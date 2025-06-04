module.exports = {

  getSaleReturnById: async (connection, returnId) => {
    const [results] = await connection.query(
      `SELECT * FROM return_details rd
      JOIN order_details od 
      ON od.invoice_id_main = rd.sales_invoice_id
      WHERE rd.return_id = ?`,
      [returnId],
    );
    return results;
  },

  getSaleReturnForMonth: async (connection, month, year, orgId) => {
    const [results] = await connection.query(
      `SELECT rd.*, od.invoice_id_main, od.customer_id, cd.customer_id, cd.cust_name FROM return_details rd
        JOIN order_details od ON od.invoice_id_main = rd.sales_invoice_id
        JOIN customer_data cd ON cd.customer_id = od.customer_id
        WHERE MONTH(rd.return_created_date) = ? AND YEAR(rd.return_created_date) = ? AND rd.org_id = ?
        ORDER BY rd.return_created_date DESC
        `,
      [
        month,
        year,
        orgId,
      ],
    );
    return results;
  },

  getSaleReturnForQuarter: async (connection, quarterStart, quarterEnd, year, orgId) => {
    const [results] = await connection.query(
      `SELECT rd.*, od.invoice_id_main, od.customer_id, cd.customer_id, cd.cust_name FROM return_details rd
        JOIN order_details od ON od.invoice_id_main = rd.sales_invoice_id
        JOIN customer_data cd ON cd.customer_id = od.customer_id
        WHERE MONTH(rd.return_created_date)>= ? AND MONTH(rd.return_created_date)<= ? AND YEAR(rd.return_created_date) = ? AND rd.org_id = ?
        ORDER BY rd.return_created_date DESC
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

  getSaleReturnForYear: async (connection, year, orgId) => {
    const [results] = await connection.query(
      `SELECT rd.*, od.invoice_id_main, od.customer_id, cd.customer_id, cd.cust_name FROM return_details rd
        JOIN order_details od ON od.invoice_id_main = rd.sales_invoice_id
        JOIN customer_data cd ON cd.customer_id = od.customer_id
        WHERE YEAR(rd.return_created_date) = ? AND rd.org_id = ?
        ORDER BY rd.return_created_date DESC
        `,
      [
        year,
        orgId,
      ],
    );
    return results;
  },

  getSaleReturnBetweenDates: async (connection, startDate, endDate, orgId) => {
    const [results] = await connection.query(
      `SELECT rd.*, od.invoice_id_main, od.customer_id, cd.customer_id, cd.cust_name FROM return_details rd
        JOIN order_details od ON od.invoice_id_main = rd.sales_invoice_id
        JOIN customer_data cd ON cd.customer_id = od.customer_id
        WHERE rd.return_created_date >= ? AND rd.return_created_date < ? AND rd.org_id = ?
        ORDER BY rd.return_created_date DESC
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
