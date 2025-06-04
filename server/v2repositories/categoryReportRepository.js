/* eslint-disable max-len */
module.exports = {
  getSaledCategoryBetweenDates: async (connection, startDate, endDate, orgId, categoryId) => {
    const [results] = await connection.query(
      `SELECT ci.*, cd.cust_name FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN customer_data cd ON od.customer_id = cd.customer_id
            JOIN batch bth ON ci.batch_id = bth.batch_id
            JOIN inventory inv ON bth.inventory_id = inv.inventory_id
            WHERE od.sales_created_date >= ? AND od.sales_created_date < ? AND od.org_id = ? AND inv.category_id = ?
            order by od.sales_created_date DESC`,
      [
        startDate,
        endDate,
        orgId,
        categoryId,
      ],
    );
    return results;
  },

  getSaledCategoryForMonth: async (connection, month, year, orgId, categoryId) => {
    const [results] = await connection.query(
      `SELECT ci.*, cd.cust_name FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN customer_data cd ON od.customer_id = cd.customer_id
            JOIN batch bth ON ci.batch_id = bth.batch_id
            JOIN inventory inv ON bth.inventory_id = inv.inventory_id
            WHERE MONTH(od.sales_created_date) = ? AND YEAR(od.sales_created_date) = ? AND od.org_id = ? AND inv.category_id = ?
            order by od.sales_created_date DESC`,
      [
        month,
        year,
        orgId,
        categoryId,
      ],
    );
    return results;
  },

  getSaledCategoryForQuarter: async (connection, quarterStart, quarterEnd, year, orgId, categoryId) => {
    const [results] = await connection.query(
      `SELECT ci.*, cd.cust_name FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN customer_data cd ON od.customer_id = cd.customer_id            
            JOIN batch bth ON ci.batch_id = bth.batch_id
            JOIN inventory inv ON bth.inventory_id = inv.inventory_id
            WHERE MONTH(od.sales_created_date) >= ? AND MONTH(od.sales_created_date) <= ? AND YEAR(od.sales_created_date) = ? AND od.org_id = ? AND inv.category_id = ?
            order by od.sales_created_date DESC`,
      [
        quarterStart,
        quarterEnd,
        year,
        orgId,
        categoryId,
      ],
    );
    return results;
  },

  getSaledCategoryForYear: async (connection, year, orgId, categoryId) => {
    const [results] = await connection.query(
      `SELECT ci.*, cd.cust_name FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN customer_data cd ON od.customer_id = cd.customer_id
            JOIN batch bth ON ci.batch_id = bth.batch_id
            JOIN inventory inv ON bth.inventory_id = inv.inventory_id
            WHERE YEAR(od.sales_created_date) = ? AND od.org_id = ? AND inv.category_id = ?
            order by od.sales_created_date DESC`,
      [
        year,
        orgId,
        categoryId,
      ],
    );
    return results;
  },
};
