module.exports = {
  getProductTransactions: async (connection, productId, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `   SELECT 
            'Sale' AS transaction_type, 
            od.invoice_id_main AS bill_no, 
            ci.cart_created_date AS transaction_date, 
            ci.saled_pri_qty_cart AS pri_issued_quantity, 
            ci.saled_sec_qty_cart AS sec_issued_quantity,
            0 AS pri_received_quantity,
            0 AS sec_received_quantity, 
            cd.cust_name AS party_name,
            cd.cust_telephone AS party_contact 
          FROM order_details od 
          JOIN cart_item ci ON od.order_id = ci.order_id
          JOIN customer_data cd ON od.customer_id = cd.customer_id
          WHERE ci.product_id = ? AND od.org_id = ? AND od.status = 'active' AND ci.cart_created_date BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Return' AS transaction_type, 
            rd.return_invoice_id AS bill_no, 
            rci.created_at AS transaction_date, 
            0 AS pri_issued_quantity,
            0 AS sec_issued_quantity,
            rci.return_pri_qty AS pri_received_quantity,
            rci.return_sec_qty AS sec_received_quantity, 
            cd.cust_name AS party_name,
            cd.cust_telephone AS party_contact 
          FROM return_details rd 
          JOIN return_cart_item rci ON rd.return_id = rci.return_id
          JOIN order_details od ON rd.sales_invoice_id = od.invoice_id_main
          JOIN customer_data cd ON od.customer_id = cd.customer_id
          WHERE rci.product_id = ? AND rd.org_id = ? AND rd.return_status = 'active' AND rci.created_at BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Purchase' AS transaction_type, 
            grn.grn_id AS bill_no, 
            grn.created_date_grn AS transaction_date, 
            0 AS pri_issued_quantity,
            0 AS sec_issued_quantity,
            gcd.qty AS pri_received_quantity,
            0 AS sec_received_quantity, 
            v.vendor_name AS party_name,
            v.vendor_contact AS party_contact 
          FROM grn 
          JOIN grn_cart_details gcd ON grn.grn_id = gcd.grn_id
          JOIN vendor v ON grn.vendor_id = v.vendor_id 
          WHERE gcd.product_id = ? AND grn.org_id = ? AND grn.status = 'active' AND grn.created_date_grn BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Debit Note' AS transaction_type, 
            dn.debit_invoice_id AS bill_no, 
            dncd.debit_created_date AS transaction_date, 
            dncd.pri_unit_debit AS pri_issued_quantity, 
            dncd.sec_unit_debit AS sec_issued_quantity,
            0 AS pri_received_quantity,
            0 AS sec_received_quantity,
            v.vendor_name AS party_name,
            v.vendor_contact AS party_contact 
          FROM debit_note dn
          JOIN debit_note_cart_details dncd ON dn.debit_invoice_id = dncd.debit_invoice_id
          JOIN vendor v ON dn.vendor_id = v.vendor_id
          WHERE dncd.product_id = ? AND dn.org_id = ? AND dn.debit_status = 'active' AND dncd.debit_created_date BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Credit Note' AS transaction_type, 
            cn.credit_invoice_id AS bill_no, 
            cncd.credit_created_date AS transaction_date, 
            cncd.pri_unit_credit AS pri_issued_quantity, 
            cncd.sec_unit_credit AS sec_issued_quantity,
            0 AS pri_received_quantity,
            0 AS sec_received_quantity,
            v.vendor_name AS party_name,
            v.vendor_contact AS party_contact 
          FROM credit_note cn
          JOIN credit_note_cart_details cncd ON cn.credit_invoice_id = cncd.credit_invoice_id
          JOIN vendor v ON cn.vendor_id = v.vendor_id
          WHERE cncd.product_id = ? AND cn.org_id = ? AND cn.credit_status = 'active' AND cncd.credit_created_date BETWEEN ? AND ?

          UNION ALL
          SELECT 
            'Direct Entry' AS transaction_type, 
            0 AS bill_no, 
            bth.created_date AS transaction_date, 
            0 AS pri_issued_quantity,
            0 AS sec_issued_quantity,
            bth.batch_qty AS pri_received_quantity,
            0 AS sec_received_quantity, 
            0 AS party_name,
            0 AS party_contact 
          FROM batch bth 
          WHERE bth.product_id = ? AND bth.org_id = ? AND grn_id is NULL AND bth.created_date BETWEEN ? AND ?

          ORDER BY transaction_date DESC`,
      [
        productId, orgId, startDate, endDate,
        productId, orgId, startDate, endDate,
        productId, orgId, startDate, endDate,
        productId, orgId, startDate, endDate,
        productId, orgId, startDate, endDate,
        productId, orgId, startDate, endDate,
      ],
    );
    return results;
  },
};
