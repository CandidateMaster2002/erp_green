module.exports = {
  getCustomerTransactions: async (
    connection,
    customerId,
    orgId,
    startDate,
    endDate,
  ) => {
    const [results] = await connection.query(
      `SELECT 
            'Sale' AS transaction_type, 
            od.invoice_id_main AS bill_no, 
            ci.cart_created_date AS transaction_date, 
            ci.saled_pri_qty_cart AS pri_issued_quantity, 
            ci.saled_sec_qty_cart AS sec_issued_quantity,
            0 AS pri_received_quantity,
            0 AS sec_received_quantity,
            sample.med_name AS product_name 
          FROM order_details od 
          JOIN cart_item ci ON od.order_id = ci.order_id
          JOIN sample on ci.product_id = sample.product_id
          WHERE od.customer_id = ? AND od.org_id = ? AND od.status = 'active' AND ci.cart_created_date BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Return' AS transaction_type, 
            rd.return_invoice_id AS bill_no, 
            rci.created_at AS transaction_date, 
            0 AS pri_issued_quantity,
            0 AS sec_issued_quantity,
            rci.return_pri_qty AS pri_received_quantity,
            rci.return_sec_qty AS sec_received_quantity,
            sample.med_name AS product_name 
          FROM return_details rd 
          JOIN return_cart_item rci ON rd.return_id = rci.return_id
          JOIN order_details od ON rd.sales_invoice_id = od.invoice_id_main
          JOIN sample on rci.product_id = sample.product_id
          WHERE od.customer_id = ? AND rd.org_id = ? AND rd.return_status = 'active' AND rci.created_at BETWEEN ? AND ?
        ORDER BY transaction_date DESC`,
      [
        customerId,
        orgId,
        startDate,
        endDate,
        customerId,
        orgId,
        startDate,
        endDate,
      ],
    );
    return results;
  },

  getDistributorTransactions: async (
    connection,
    distributorId,
    orgId,
    startDate,
    endDate,
  ) => {
    const [results] = await connection.query(
      `SELECT 
            'Purchase' AS transaction_type, 
            grn.grn_id AS bill_no, 
            grn.created_date_grn AS transaction_date, 
            0 AS pri_issued_quantity,
            0 AS sec_issued_quantity,
            gcd.qty AS pri_received_quantity,
            0 AS sec_received_quantity,
            sample.med_name AS product_name
          FROM grn 
          JOIN grn_cart_details gcd ON grn.grn_id = gcd.grn_id
          JOIN sample on gcd.product_id = sample.product_id         
          WHERE grn.vendor_id = ? AND grn.org_id = ? AND grn.status = 'active' AND grn.created_date_grn BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Debit Note' AS transaction_type, 
            dn.debit_invoice_id AS bill_no, 
            dncd.debit_created_date AS transaction_date, 
            dncd.pri_unit_debit AS pri_issued_quantity, 
            dncd.sec_unit_debit AS sec_issued_quantity,
            0 AS pri_received_quantity,
            0 AS sec_received_quantity,
            sample.med_name AS product_name
          FROM debit_note dn
          JOIN debit_note_cart_details dncd ON dn.debit_invoice_id = dncd.debit_invoice_id
          JOIN sample on dncd.product_id = sample.product_id
          WHERE dn.vendor_id = ? AND dn.org_id = ? AND dn.debit_status = 'active' AND dncd.debit_created_date BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Credit Note' AS transaction_type, 
            cn.credit_invoice_id AS bill_no, 
            cncd.credit_created_date AS transaction_date, 
            cncd.pri_unit_credit AS pri_issued_quantity, 
            cncd.sec_unit_credit AS sec_issued_quantity,
            0 AS pri_received_quantity,
            0 AS sec_received_quantity,
            sample.med_name AS product_name
          FROM credit_note cn
          JOIN credit_note_cart_details cncd ON cn.credit_invoice_id = cncd.credit_invoice_id
          JOIN sample on cncd.product_id = sample.product_id
          WHERE cn.vendor_id = ? AND cn.org_id = ? AND cn.credit_status = 'active' AND cncd.credit_created_date BETWEEN ? AND ?
        ORDER BY transaction_date DESC`,
      [
        distributorId,
        orgId,
        startDate,
        endDate,
        distributorId,
        orgId,
        startDate,
        endDate,
        distributorId,
        orgId,
        startDate,
        endDate,
      ],
    );
    return results;
  },
};
