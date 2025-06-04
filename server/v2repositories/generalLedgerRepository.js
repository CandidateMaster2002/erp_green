module.exports = {

  getAllAcountLedger: async (
    connection,
    orgId,
    startDate,
    endDate,
  ) => {
    const [results] = await connection.query(
      `SELECT 
        'Sale' AS transaction_type, 
        od.invoice_id_main AS bill_no, 
        od.sales_created_date AS transaction_date, 
        ROUND(od.grand_total, 0) AS credit_amount, 
        0 AS debit_amount,
        cd.cust_name AS party_name
      FROM order_details od 
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      WHERE od.org_id = ? AND od.status = 'active' AND od.sales_created_date BETWEEN ? AND ?

      UNION ALL
      SELECT 
        'Return' AS transaction_type, 
        rd.return_invoice_id AS bill_no, 
        rd.return_created_date AS transaction_date, 
        0 AS credit_amount,
        ROUND(rd.return_amount, 0) AS debit_amount,
        cd.cust_name AS party_name
      FROM return_details rd 
      JOIN order_details od ON rd.sales_invoice_id = od.invoice_id_main
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      WHERE rd.org_id = ? AND rd.return_status = 'active' AND rd.return_created_date BETWEEN ? AND ?

      UNION ALL
      SELECT 
        'Purchase' AS transaction_type, 
        grn.grn_id AS bill_no, 
        grn.created_date_grn AS transaction_date, 
        0 AS credit_amount,
        ROUND(grn.total + grn.total_sgst + grn.total_cgst + grn.total_igst - grn.less_discount + grn.credit_debit, 0) AS debit_amount,
        v.vendor_name AS party_name
      FROM grn 
      JOIN vendor v ON grn.vendor_id = v.vendor_id 
      WHERE grn.org_id = ? AND grn.status = 'active' AND grn.created_date_grn BETWEEN ? AND ?

      UNION ALL
      SELECT 
        'Debit Note' AS transaction_type, 
        dn.debit_invoice_id AS bill_no, 
        dn.created_date AS transaction_date, 
        ROUND(dn.debit_amt + dn.total_sgst + dn.total_cgst + dn.total_igst - dn.less_discount, 0) AS credit_amount,
        0 AS debit_amount,
        v.vendor_name AS party_name
      FROM debit_note dn
      JOIN vendor v ON dn.vendor_id = v.vendor_id
      WHERE dn.org_id = ? AND dn.debit_status = 'active' AND dn.created_date BETWEEN ? AND ?

      UNION ALL
      SELECT 
        'Credit Note' AS transaction_type, 
        cn.credit_invoice_id AS bill_no, 
        cn.created_date_credit AS transaction_date, 
        ROUND(cn.credit_amt + cn.total_sgst + cn.total_cgst + cn.total_igst - cn.less_discount, 0) AS credit_amount,
        0 AS debit_amount,
        v.vendor_name AS party_name
      FROM credit_note cn
      JOIN vendor v ON cn.vendor_id = v.vendor_id
      WHERE cn.org_id = ? AND cn.credit_status = 'active' AND cn.created_date_credit BETWEEN ? AND ?

      ORDER BY transaction_date DESC`,
      [
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
      ],

    );
    return results;
  },

  getSaleLedger: async (
    connection,
    orgId,
    startDate,
    endDate,
  ) => {
    const [results] = await connection.query(
      `SELECT 
        'Sale' AS transaction_type, 
        od.invoice_id_main AS bill_no, 
        od.sales_created_date AS transaction_date, 
        ROUND(od.grand_total, 0) AS credit_amount, 
        0 AS debit_amount,
        cd.cust_name AS party_name
      FROM order_details od 
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      WHERE od.org_id = ? AND od.status = 'active' AND od.sales_created_date BETWEEN ? AND ?

      UNION ALL
      SELECT 
        'Return' AS transaction_type, 
        rd.return_invoice_id AS bill_no, 
        rd.return_created_date AS transaction_date, 
        0 AS credit_amount,
        ROUND(rd.return_amount, 0) AS debit_amount,
        cd.cust_name AS party_name
      FROM return_details rd 
      JOIN order_details od ON rd.sales_invoice_id = od.invoice_id_main
      JOIN customer_data cd ON od.customer_id = cd.customer_id
      WHERE rd.org_id = ? AND rd.return_status = 'active' AND rd.return_created_date BETWEEN ? AND ?

      ORDER BY transaction_date DESC`,
      [
        orgId, startDate, endDate,
        orgId, startDate, endDate,
      ],

    );
    return results;
  },

  getPurchaseLedger: async (
    connection,
    orgId,
    startDate,
    endDate,
  ) => {
    const [results] = await connection.query(
      `
      SELECT 
        'Purchase' AS transaction_type, 
        grn.grn_id AS bill_no, 
        grn.created_date_grn AS transaction_date, 
        0 AS credit_amount,
        ROUND(grn.total + grn.total_sgst + grn.total_cgst + grn.total_igst - grn.less_discount + grn.credit_debit, 0) AS debit_amount,
        v.vendor_name AS party_name
      FROM grn 
      JOIN vendor v ON grn.vendor_id = v.vendor_id 
      WHERE grn.org_id = ? AND grn.status = 'active' AND grn.created_date_grn BETWEEN ? AND ?

      UNION ALL
      SELECT 
        'Debit Note' AS transaction_type, 
        dn.debit_invoice_id AS bill_no, 
        dn.created_date AS transaction_date, 
        ROUND(dn.debit_amt + dn.total_sgst + dn.total_cgst + dn.total_igst - dn.less_discount, 0) AS credit_amount,
        0 AS debit_amount,
        v.vendor_name AS party_name
      FROM debit_note dn
      JOIN vendor v ON dn.vendor_id = v.vendor_id
      WHERE dn.org_id = ? AND dn.debit_status = 'active' AND dn.created_date BETWEEN ? AND ?

      UNION ALL
      SELECT 
        'Credit Note' AS transaction_type, 
        cn.credit_invoice_id AS bill_no, 
        cn.created_date_credit AS transaction_date, 
        ROUND(cn.credit_amt + cn.total_sgst + cn.total_cgst + cn.total_igst - cn.less_discount, 0) AS credit_amount,
        0 AS debit_amount,
        v.vendor_name AS party_name
      FROM credit_note cn
      JOIN vendor v ON cn.vendor_id = v.vendor_id
      WHERE cn.org_id = ? AND cn.credit_status = 'active' AND cn.created_date_credit BETWEEN ? AND ?

      ORDER BY transaction_date DESC`,
      [
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
      ],

    );
    return results;
  },
};
