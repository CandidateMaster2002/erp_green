/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { getPool } = require('../config/database');

const date_time = new Date();
module.exports = {
  // Create Credit Note
  createCreditNote: (data, creditInvoice, callBack) => {
    getPool().query(
      `insert into credit_note(
                  credit_invoice_id,
                  vendor_id,
                  org_id,
                  credit_amt,
                  less_discount)
                  value(?,?,?,?,?)`,
      [
        creditInvoice,
        data.vendor_id,
        data.org_id,
        data.credit_amt,
        data.less_discount,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },
  createCreditNoteCarts: (data, callBack) => {
    getPool().query(
      `insert into credit_note_cart_details(
                  
                  credit_invoice_id,
                  product_id,
                  batch_id_credit,
                  pri_unit_credit,
                  sec_unit_credit,
                  total_credit)
                  value(?,?,?,?,?,?)`,
      [
        data.credit_invoice_no,
        data.product_id,
        data.batch_id_credit,
        data.pri_unit_credit,
        data.sec_unit_credit,
        data.total_credit,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  getTotalCreditNotes: (callback) => {
    getPool().query(
      'SELECT COUNT(*) as total_rows FROM credit_note',
      [],
      (error, results) => {
        if (error) return callback(error);
        const totalCount = JSON.parse(results[0].total_rows);
        return callback(null, totalCount);
      },
    );
  },

  // get all inventory details in credit ejs
  getINVDetailsinCreditNote: (orgId, callBack) => {
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

  getCreditNoteinInvoice: (id, orgId, callBack) => {
    getPool().query(
      `SELECT DISTINCT vendor.*, crdetails.*, cr.less_discount, cr.credit_amt, cr.credit_status, inv.*, batch.*,  sample.med_name FROM credit_note cr
      JOIN credit_note_cart_details crdetails ON cr.credit_invoice_id = crdetails.credit_invoice_id
      Join vendor on cr.vendor_id = vendor.vendor_id
      Join sample on crdetails.product_id = sample.product_id
      Join batch on batch.batch_id = crdetails.batch_id_credit 
      Join inventory inv on inv.product_id = crdetails.product_id
      where cr.credit_invoice_id = ? and inv.org_id = ${orgId}
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

  searchMonth: (orgId, month, year, callback) => {
    getPool().query(
      `SELECT DISTINCT * FROM credit_note cn
      Join vendor on vendor.vendor_id = cn.vendor_id
      where MONTH(cn.created_date_credit)=? AND YEAR(cn.created_date_credit) = ${year} and cn.org_id = ${orgId}
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
      `SELECT DISTINCT * FROM credit_note cn
      Join vendor on vendor.vendor_id = cn.vendor_id
      where MONTH(cn.created_date_credit)>=? and MONTH(cn.created_date_credit)<=? AND YEAR(cn.created_date_credit) = ${year} and cn.org_id = ${orgId} 
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
      `SELECT * FROM credit_note cn
      JOIN vendor on vendor.vendor_id = cn.vendor_id
      where YEAR(cn.created_date_credit)=? and cn.org_id = ${orgId} 
      order by MONTH(cn.created_date_credit) DESC
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

  searchDates: (orgId, from, to, callback) => {
    let querys;
    let datas = [];
    if (from && to) {
      const date = new Date(to);
      querys = 'WHERE created_date_credit >= ? AND created_date_credit < ?';
      datas = [
        from,
        new Date(date.getTime() + 86400000),
      ];
    } else if (from) {
      querys = 'WHERE created_date_credit >= ?';
      datas = [from];
    } else if (to) {
      const date = new Date(to);
      querys = 'WHERE created_date_credit < ?';
      datas = [new Date(date.getTime() + 86400000)];
    }

    getPool().query(
      `SELECT * FROM credit_note cn
      JOIN vendor on vendor.vendor_id = cn.vendor_id
      ${querys} and cn.org_id = ${orgId} 
      ORDER BY created_date_credit DESC`,
      datas,
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  creditDetailsToTransactions: (data, creditInvoiceId, callBack) => {
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
        creditInvoiceId,
        'credit',
        data.credit_amt,
        data.credit_amt,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  getCreditNote: (creditInvoiceId, orgId, callback) => {
    getPool().query(
      'SELECT * FROM credit_note WHERE credit_invoice_id = ? and org_id = ?',
      [
        creditInvoiceId,
        orgId,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  cancelCreditNote: (creditInvoiceId, orgId, callback) => {
    getPool().query(
      'UPDATE credit_note SET credit_status = "cancelled" WHERE credit_invoice_id = ? and org_id = ?',
      [
        creditInvoiceId,
        orgId,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getCrnCartItemsById: (creditInvoiceId, callback) => {
    getPool().query(
      `SELECT * FROM credit_note_cart_details 
       WHERE credit_invoice_id = ?`,
      [creditInvoiceId],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
};
