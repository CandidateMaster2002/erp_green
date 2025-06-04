/* eslint-disable no-tabs */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const { getPool } = require('../config/database');

module.exports = {
  create: (data, invoiceId, callback) => {
    getPool().query(
      `insert into order_details(org_id, customer_id, invoice_id_main, subtotal, total_dist, grand_total, mop, current_total, doctor_name) 
                                    values(?,?,?,?,?,?,?,?,?)`,
      [
        data.org_id,
        data.customer_id,
        invoiceId,
        data.subtotal,
        data.total_dist,
        data.grand_total,
        data.mop,
        data.current_total,
        data.doctor_name,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  cancelSalesInvoice: (orderId, orgId, callback) => {
    getPool().query(
      'UPDATE order_details SET status = "cancelled" WHERE order_id = ? and org_id = ?',
      [orderId, orgId],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  searchTotalSales: (orgId, month, year, callback) => {
    getPool().query(
      `SELECT COUNT(*) as total_rows FROM order_details od
      JOIN customer_data cd
      ON cd.customer_id = od.customer_id
      WHERE SUBSTRING(invoice_id_main, 20, 4) = ${month}${year} and cd.org_id =${orgId}
      `,
      [],
      (error, results) => {
        if (error) return callback(error);

        const totalCount = JSON.parse(results[0].total_rows);
        console.log(results);
        return callback(null, totalCount);
      },
    );
  },

  createNewMonth: (month, year, count, callback) => {
    getPool().query(

      `insert into sales_month_count(month, year, count)
      values(?,?,?)`,
      [
        month,
        year,
        count,
      ],
      (error, results) => {
        if (error) {
          console.log('error in createNewMonth', error);
        }
        return callback(null, results);
      },
    );
  },

  updateMonthCount: (month, year, count) => {
    getPool().query(

      'update sales_month_count set count=? where month=? and year =?',
      [
        count,
        month,
        year,
      ],
      (error, results) => {
        if (error) console.log('error in update month', error);
        console.log('results of update', results);
      },
    );
  },

  getMonthCount: (month, year, callback) => {
    getPool().query(
      'select * from sales_month_count where month=? and year =?',
      [
        month,
        year,
      ],
      (error, results) => {
        if (error) {
          console.log('error in getting count', error);
          return callback(error);
        }
        console.log('results of count', results);
        return callback(null, results);
      },
    );
  },

  getAllOrders: (id, callback) => {
    getPool().query(
      `select * from order_details where customer_id = ?
        ORDER BY sales_created_date DESC`,
      [id],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  mainId: (id, callback) => {
    getPool().query(
      'select invoice_id_main from order_details where order_id = ?',
      [id],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getSalesIdforReport: (id, callback) => {
    getPool().query(
      'select order_id from order_details where invoice_id_main = ?',
      [id],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getInvoiceOrder: (salesId, orgId, callback) => {
    getPool().query(
      `select * from order_details od 
        join customer_data cd 
        on od.customer_id = cd.customer_id
        where od.order_id=? and cd.org_id = ?`,
      [salesId,
        orgId],
      (error, results) => {
        if (error) return callback(error);

        return callback(null, results);
      },
    );
  },

  invoiceSales: (salesId, orgId, callback) => {
    getPool().query(
      `select * from order_details od 
        join customer_data cd 
        on od.customer_id = cd.customer_id
        where od.invoice_id_main=? and cd.org_id = ?
        ORDER BY od.sales_created_date DESC`,
      [salesId,
        orgId],
      (error, results) => {
        if (error) return callback(error);

        return callback(null, results);
      },
    );
  },

  getRevenue: (orgId, callback) => {
    getPool().query(
      `select * from order_details od
      JOIN customer_data cd 
      on cd.customer_id = od.customer_id 
      where cd.org_id = ${orgId}`,
      [],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  searchDates: (orgId, from, to, callback) => {
    let querys;
    let datas = [];
    if (from && to) {
      const date = new Date(to);
      querys = 'WHERE sales_created_date >= ? AND sales_created_date < ?';
      datas = [
        from,
        new Date(date.getTime() + 86400000),
      ];
    } else if (from) {
      querys = 'WHERE sales_created_date >= ?';
      datas = [from];
    } else if (to) {
      const date = new Date(to);
      querys = 'WHERE sales_created_date < ?';
      datas = [new Date(date.getTime() + 86400000)];
    }

    getPool().query(
      `SELECT * FROM order_details od
      JOIN customer_data cd 
      ON od.customer_id = cd.customer_id
      ${querys} and cd.org_id = ${orgId} 
      ORDER BY sales_created_date DESC`,
      datas,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchMonth: (orgId, month, year, callback) => {
    getPool().query(
      `SELECT * FROM order_details od
      JOIN customer_data cd 
      ON od.customer_id = cd.customer_id
      where MONTH(od.sales_created_date) = ${month} AND YEAR(od.sales_created_date) = ${year} AND cd.org_id = ${orgId} 
      `,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchQuarter: (orgId, start, end, year, callback) => {
    getPool().query(
      `SELECT * FROM order_details od
      JOIN customer_data cd 
      ON od.customer_id = cd.customer_id
      where MONTH(od.sales_created_date)>= ${start} and MONTH(od.sales_created_date)<= ${end} AND YEAR(od.sales_created_date) = ${year} and cd.org_id = ${orgId} 
      `,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
  searchYear: (orgId, year, callback) => {
    getPool().query(
      `SELECT * FROM order_details od
      JOIN customer_data cd 
      ON od.customer_id = cd.customer_id
      where YEAR(od.sales_created_date)= ${year} and cd.org_id = ${orgId} 
      order by MONTH(od.sales_created_date) DESC
      `,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  // LEFT JOIN
  // customer_data AS cd ON cd.customer_id = od.customer_id
  // where cd.org_id = ?
  getTotalSumfromSales: (orgId, callback) => {
    console.log('service org', orgId);
    getPool().query(
      `SELECT
       CASE months.month
          WHEN 1 THEN 'Jan'
          WHEN 2 THEN 'Feb'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Apr'
          WHEN 5 THEN 'May'
          WHEN 6 THEN 'Jun'
          WHEN 7 THEN 'Jul'
          WHEN 8 THEN 'Aug'
          WHEN 9 THEN 'Sept'
          WHEN 10 THEN 'Oct'
          WHEN 11 THEN 'Nov'
          WHEN 12 THEN 'Dec'
          END AS x,
          COALESCE(SUM(od.grand_total), 0) AS total
          FROM
              (SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
              UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
              UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) AS months
          LEFT JOIN
              order_details od ON MONTH(od.sales_created_date) = months.month
          LEFT JOIN
              customer_data cd ON cd.customer_id = od.customer_id
          where
              cd.org_id = ?
          GROUP BY
              months.month;
          `,
      [orgId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getSalesForDay: async (orgId, salesDateTime) => {
    const pool = getPool().promise();
    const [result] = await pool.query(
      `SELECT COALESCE(SUM(grand_total), 0) AS total_sales
      FROM order_details
      WHERE org_id = ? AND sales_created_date <= ?`,
      [orgId, salesDateTime],
    );
    return result[0].total_sales;
  },

  getSalesForMonth: async (orgId, month, year) => {
    const pool = getPool().promise();
    const [result] = await pool.query(
      `SELECT COALESCE(SUM(grand_total), 0) AS total_sales
      FROM order_details
      WHERE org_id = ? AND MONTH(sales_created_date) = ? AND YEAR(sales_created_date) = ?`,
      [orgId, month, year],
    );
    return result[0].total_sales;
  },

  getSalesForYear: async (orgId, year) => {
    const pool = getPool().promise();
    const [result] = await pool.query(
      `SELECT COALESCE(SUM(grand_total), 0) AS total_sales
      FROM order_details
      WHERE org_id = ? AND YEAR(sales_created_date) = ?`,
      [orgId, year],
    );
    return result[0].total_sales;
  },

  // salesMadePrevYear: (orgId, callback) => {
  //   getPool().query(
  //     `SELECT
  //     YEAR(od.sales_created_date) AS date,
  //     COUNT(*) AS row_count
  //     FROM
  //      order_details as od
  //    JOIN customer_data as cd
  //      on cd.customer_id = od.customer_id
  //      where cd.org_id = ?
  //    GROUP BY
  //        YEAR(od.sales_created_date)
  //    order by YEAR(od.sales_created_date) DESC limit 2
  //   `,
  //     [orgId],
  //     (error, results) => {
  //       if (error) return callback(error);
  //       return callback(null, results);
  //     },
  //   );
  // },

  getProfitinHome: (callback) => {
    getPool().query(

      `
      select ct.saled_mrp as mrp, ct.cart_created_date as date, (ct.saled_pri_qty_cart*batch.purchase_rate + ct.saled_sec_qty_cart*batch.purchase_rate/batch.conversion) as purchaserate
      from cart_item ct
      join batch on batch.batch_id  = ct.batch_id
      where ct.saled_mrp >0

      `,
      [

      ],
      (error, results) => {
        if (error) {
          console.log(error);
        }
        return callback(null, results);
      },
    );
  },

};
