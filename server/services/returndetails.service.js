const { getPool } = require('../config/database');

module.exports = {
  createReturnOrder: (data, returnId, callback) => {
    getPool().query(
      `insert into return_details(org_id, return_invoice_id, sales_invoice_id, return_subtotal, new_return_discount, return_amount, reason) 
                                      values(?,?,?,?,?,?,?)`,
      [
        data.org_id,
        returnId,
        data.sales_invoice_id,
        data.return_subtotal,
        data.new_return_discount,
        data.return_amount,
        data.reason,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getTotalReturns: (callback) => {
    getPool().query(
      'SELECT COUNT(*) as total_rows FROM return_details',
      [],
      (error, results) => {
        if (error) return callback(error);
        const totalCount = JSON.parse(results[0].total_rows);
        return callback(null, totalCount);
      },
    );
  },

  searchDates: (orgId, from, to, callback) => {
    let querys;
    let datas = [];
    if (from && to) {
      const date = new Date(to);
      querys = 'WHERE return_created_date >= ? AND return_created_date < ?';
      datas = [
        from,
        new Date(date.getTime() + 86400000),
      ];
    } else if (from) {
      querys = 'WHERE return_created_date >= ?';
      datas = [from];
    } else if (to) {
      const date = new Date(to);
      querys = 'WHERE return_created_date < ?';
      datas = [new Date(date.getTime() + 86400000)];
    }
    getPool().query(
      `SELECT * FROM return_details rd
      JOIN order_details od 
      ON od.invoice_id_main = rd.sales_invoice_id
      JOIN customer_data cd
      on cd.customer_id = od.customer_id
      ${querys} and cd.org_id = ${orgId} 
      ORDER BY return_created_date DESC`,
      datas,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchMonth: (orgId, month, year, callback) => {
    getPool().query(
      `SELECT * FROM return_details rd
      JOIN order_details od 
      ON od.invoice_id_main = rd.sales_invoice_id
      JOIN customer_data cd
      on cd.customer_id = od.customer_id
      where MONTH(rd.return_created_date) = ${month} AND YEAR(rd.return_created_date) = ${year} and cd.org_id = ${orgId} 
      `,
      [],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchQuarter: (orgId, start, end, year, callback) => {
    getPool().query(
      `SELECT * FROM return_details rd
      JOIN order_details od 
      ON od.invoice_id_main = rd.sales_invoice_id
      JOIN customer_data cd
      on cd.customer_id = od.customer_id
      where MONTH(rd.return_created_date)>=${start} and MONTH(rd.return_created_date)<=${end} AND YEAR(rd.return_created_date) = ${year} and cd.org_id = ${orgId} 
      `,
      [],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
  searchYear: (orgId, year, callback) => {
    getPool().query(
      `SELECT * FROM return_details rd
      JOIN order_details od 
      ON od.invoice_id_main = rd.sales_invoice_id
      JOIN customer_data cd
      on cd.customer_id = od.customer_id
      where YEAR(rd.return_created_date)=${year} and cd.org_id = ${orgId} 
      order by MONTH(rd.return_created_date) DESC
      `,
      [],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  returnDetails: (id, callback) => {
    getPool().query(
      `select * from  return_details rd
        join order_details od 
        on od.invoice_id_main = rd.sales_invoice_id
        Join customer_data cd
        on cd.customer_id = od.customer_id

        where rd.return_id=?`,
      [
        id,
      ],
      (error, results) => {
        if (error) return callback(error);

        return callback(null, results);
      },
    );
  },

  cancelReturnInvoice: (returnId, orgId, callback) => {
    getPool().query(
      'UPDATE return_details SET return_status = "cancelled" WHERE return_id = ? AND org_id = ?',
      [returnId, orgId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
};
