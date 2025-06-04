/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { getPool } = require('../config/database');

const date_time = new Date();

module.exports = {
  createDebitNote: (data, DebitInvoice, callback) => {
    getPool().query(
      'insert into debit_note(debit_invoice_id,vendor_id,org_id, debit_amt, less_discount) value(?,?,?,?,?)',
      [DebitInvoice, data.vendor_id, data.org_id, data.debit_amt, data.less_discount],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },
  createDebitNoteCart: (data, callback) => {
    getPool().query(
      'insert into debit_note_cart_details(debit_invoice_id,product_id,batch_id_debit,pri_unit_debit,sec_unit_debit,total_debit) value(?,?,?,?,?,?)',
      [data.debit_invoice_no,
        data.product_id,
        data.batch_id_debit,
        data.pri_unit_debit,
        data.sec_unit_debit,
        data.total_debit],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },

    );
  },
  getTotalDebitNotes: (callback) => {
    getPool().query(
      'SELECT COUNT(*) as total_rows FROM debit_note',
      [],
      (error, results) => {
        if (error) return callback(error);
        const totalCount = JSON.parse(results[0].total_rows);
        return callback(null, totalCount);
      },
    );
  },

  // get all inventory details in credit ejs

  getINVDetailsinDebitNote: (orgId, callBack) => {
    getPool().query(
      `SELECT * FROM inventory inv
      JOIN sample spl ON inv.product_id = spl.product_id
      where inv.org_id= ?
      `,
      [
        orgId,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  getDebitNoteinInvoice: (id, orgId, callBack) => {
    getPool().query(
      `SELECT DISTINCT vendor.*, dbdetails.*, db.less_discount, db.debit_amt, db.debit_status, inv.*,  batch.*,  sample.med_name FROM debit_note db
      JOIN debit_note_cart_details dbdetails ON db.debit_invoice_id = dbdetails.debit_invoice_id
      Join vendor on db.vendor_id = vendor.vendor_id
      Join sample on dbdetails.product_id = sample.product_id
      Join batch on batch.batch_id = dbdetails.batch_id_debit 
      Join inventory inv on inv.product_id = dbdetails.product_id
      where db.debit_invoice_id = ? and inv.org_id = ${orgId}
      `,
      [
        id,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  searchDates: (orgId, from, to, callback) => {
    let querys;
    let datas = [];
    if (from && to) {
      const date = new Date(to);
      querys = 'WHERE dn.created_date >= ? AND dn.created_date < ?';
      datas = [
        from,
        new Date(date.getTime() + 86400000),
      ];
    } else if (from) {
      querys = 'WHERE dn.created_date >= ?';
      datas = [from];
    } else if (to) {
      const date = new Date(to);
      querys = 'WHERE dn.created_date < ?';
      datas = [new Date(date.getTime() + 86400000)];
    }

    getPool().query(
      `SELECT * FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      ${querys} and dn.org_id = ${orgId} 
      ORDER BY dn.created_date DESC`,
      datas,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
  searchMonth: (orgId, month, year, callback) => {
    getPool().query(
      `SELECT * FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      where MONTH(dn.created_date)=? AND YEAR(dn.created_date) = ${year} and dn.org_id = ${orgId} 
      `,
      [
        month,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchQuarter: (orgId, start, end, year, callback) => {
    getPool().query(
      `SELECT * FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      where MONTH(dn.created_date)>=? and MONTH(dn.created_date)<=? AND YEAR(dn.created_date) = ${year} and dn.org_id = ${orgId} 
      `,
      [
        start,
        end,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  searchYear: (orgId, year, callback) => {
    getPool().query(
      `SELECT * FROM debit_note dn
      JOIN vendor ON vendor.vendor_id = dn.vendor_id
      where YEAR(dn.created_date)=? and dn.org_id = ${orgId} 
      order by MONTH(dn.created_date) DESC
      `,
      [
        year,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  debitDetailsToTransactions: (data, debitInvoiceId, callBack) => {
    getPool().query(
      `insert into transactions(
                  org_id,
                  vendor_id,
                  note_id,
                  transaction_type,
                  adjustment_amt,
                  balance_amt)
                  value(?,?,?,?,?,?)`,
      [
        data.org_id,
        data.vendor_id,
        debitInvoiceId,
        'debit',
        data.debit_amt,
        data.debit_amt,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  getDebitNote: (debitInvoiceId, orgId, callback) => {
    getPool().query(
      `SELECT * FROM debit_note WHERE 
      debit_invoice_id = ? and org_id = ?`,
      [
        debitInvoiceId,
        orgId,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  cancelDebitNote: (debitInvoiceId, orgId, callback) => {
    getPool().query(
      `UPDATE debit_note SET debit_status = 'cancelled' WHERE 
      debit_invoice_id = ? and org_id = ?`,
      [
        debitInvoiceId,
        orgId,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getDrnCartItemsById: (debitInvoiceId, callback) => {
    getPool().query(
      'SELECT * FROM debit_note_cart_details WHERE debit_invoice_id = ?',
      [
        debitInvoiceId,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },
};
