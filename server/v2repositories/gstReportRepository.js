module.exports = {

  // Outward Supplies
  outwardB2CL: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT 
            'GST Sale - 5%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total > 250000
            AND od.status = 'active' AND ci.gst = 5 AND od.sales_created_date BETWEEN ? AND ?
            
        UNION
        SELECT
            'GST Sale - 12%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total > 250000
            AND od.status = 'active' AND ci.gst = 12 AND od.sales_created_date BETWEEN ? AND ?

        UNION
        SELECT
            'GST Sale - 18%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total > 250000
            AND od.status = 'active' AND ci.gst = 18 AND od.sales_created_date BETWEEN ? AND ?

        UNION
        SELECT
            'GST Sale - 28%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total > 250000
            AND od.status = 'active' AND ci.gst = 28 AND od.sales_created_date BETWEEN ? AND ?
        `,
      [
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
      ],
    );
    return results;
  },

  outwardB2CS: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT 
            'GST Sale - 5%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total <= 250000
            AND od.status = 'active' AND ci.gst = 5 AND od.sales_created_date BETWEEN ? AND ?
         
        UNION
        SELECT
            'GST Sale - 12%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total <= 250000
            AND od.status = 'active' AND ci.gst = 12 AND od.sales_created_date BETWEEN ? AND ?

        UNION
        SELECT
            'GST Sale - 18%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total <= 250000
            AND od.status = 'active' AND ci.gst = 18 AND od.sales_created_date BETWEEN ? AND ?

        UNION
        SELECT
            'GST Sale - 28%' AS tax_category,
            org.org_pincode AS pincode,
            'Counter Sale' AS type_of_supply,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            JOIN organisation org ON od.org_id = org.org_id
            WHERE od.org_id = ? AND od.grand_total <= 250000
            AND od.status = 'active' AND ci.gst = 28 AND od.sales_created_date BETWEEN ? AND ?
         `,
      [
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
        orgId, startDate, endDate,
      ],
    );
    return results;
  },

  outwardNilExemp: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT 
            'Nil rated' AS tax_category,
            ci.gst AS rate,
            od.grand_total,
            ci.hsn, ci.saled_mrp
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            WHERE od.org_id = ?
            AND od.status = 'active' AND ci.gst = 0 AND od.sales_created_date BETWEEN ? AND ?
            `,
      [orgId, startDate, endDate],
    );
    return results;
  },

  outwardCDNR: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
            v.vendor_gstin AS receipient_gstin,
            v.vendor_name AS receiver_name,
            dn.debit_invoice_id as note_number,
            'Debit Note' as note_type,
            'B2B' as note_supply_type,
            dn.created_date AS note_date,
            (dn.debit_amt - dn.less_discount + dn.total_sgst + dn.total_cgst + dn.total_igst) AS note_value,
            inv.gst AS rate,
            dncd.total_debit,
            dn.debit_amt,
            dn.less_discount
            FROM debit_note dn
            JOIN debit_note_cart_details dncd ON dn.debit_invoice_id = dncd.debit_invoice_id
            JOIN batch bth ON dncd.batch_id_debit = bth.batch_id
            JOIN inventory inv ON bth.inventory_id = inv.inventory_id
            JOIN vendor v ON dn.vendor_id = v.vendor_id
            WHERE dn.org_id = ? AND dn.debit_status = 'active' AND dn.created_date BETWEEN ? AND ?
        `,
      [orgId, startDate, endDate],
    );
    return results;
  },

  outwardHSNWiseSaleDetails: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
            ci.hsn,
            ci.gst AS rate,
            od.subtotal, od.total_dist, od.grand_total,
            ci.saled_mrp, ci.conversion,
            ci.saled_pri_qty_cart AS pri_qty, 
            ci.saled_sec_qty_cart AS sec_qty,
            'Counter Sale' AS type_of_supply
            FROM order_details od
            JOIN cart_item ci ON od.order_id = ci.order_id
            WHERE od.org_id = ? AND od.status = 'active' AND od.sales_created_date BETWEEN ? AND ?
        `,
      [orgId, startDate, endDate],
    );
    return results;
  },

  outwardHSNWiseDebitDetails: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
            v.vendor_gstin AS receipient_gstin,
            v.vendor_id,
            inv.hsn,
            inv.gst AS rate,
            bth.conversion,
            dncd.pri_unit_debit AS pri_qty,
            dncd.sec_unit_debit AS sec_qty,
            dncd.total_debit,
            dn.debit_amt,
            dn.less_discount,
            'Purchase Return' AS type_of_supply
            FROM debit_note dn
            JOIN debit_note_cart_details dncd ON dn.debit_invoice_id = dncd.debit_invoice_id
            JOIN batch bth ON dncd.batch_id_debit = bth.batch_id
            JOIN inventory inv ON bth.inventory_id = inv.inventory_id
            JOIN vendor v ON dn.vendor_id = v.vendor_id
            WHERE dn.org_id = ? AND dn.debit_status = 'active' AND dn.created_date BETWEEN ? AND ?
        `,
      [orgId, startDate, endDate],
    );
    return results;
  },

  // Inwards Supplies
  inwardB2B: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
            v.vendor_gstin AS receipient_gstin,
            v.vendor_name AS receiver_name,
            grn.grn_id AS invoice_number,
            grn.vendor_invoice AS bill_number,
            grn.created_date_grn AS invoice_date,
            org.org_gstin AS supplier_gstin,
            'Regular' AS type_of_supply,
            gcd.gst AS rate,
            (grn.total - grn.less_discount + grn.total_sgst + grn.total_cgst + grn.total_igst + grn.credit_debit) AS invoice_value,
            grn.total AS total_gross,
            grn.less_discount,
            gcd.hsn,
            ((gcd.purchase * (gcd.qty - gcd.free)) - gcd.bulk_discount) AS item_value
            FROM grn
            JOIN grn_cart_details gcd ON grn.grn_id = gcd.grn_id
            JOIN organisation org ON grn.org_id = org.org_id
            JOIN vendor v ON grn.vendor_id = v.vendor_id
            WHERE grn.org_id = ?
            AND grn.status = 'active' AND grn.created_date_grn BETWEEN ? AND ?
        `,
      [
        orgId, startDate, endDate,
      ],
    );
    return results;
  },

  inwardNilExemp: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
            v.vendor_gstin AS receipient_gstin,
            v.vendor_name AS receiver_name,
            grn.grn_id AS invoice_number,
            grn.vendor_invoice AS bill_number,
            grn.created_date_grn AS invoice_date,
            org.org_gstin AS supplier_gstin,
            'Regular' AS type_of_supply,
            gcd.gst AS rate,
            (grn.total - grn.less_discount + grn.total_sgst + grn.total_cgst + grn.total_igst + grn.credit_debit) AS invoice_value,
            grn.total AS total_gross,
            grn.less_discount,
            gcd.hsn,
            ((gcd.purchase * (gcd.qty - gcd.free)) - gcd.bulk_discount) AS item_value
            FROM grn
            JOIN grn_cart_details gcd ON grn.grn_id = gcd.grn_id
            JOIN organisation org ON grn.org_id = org.org_id
            JOIN vendor v ON grn.vendor_id = v.vendor_id
            WHERE grn.org_id = ?
            AND grn.status = 'active' AND gcd.gst = 0 AND grn.created_date_grn BETWEEN ? AND ?
        `,
      [
        orgId, startDate, endDate,
      ],
    );
    return results;
  },

  inwardCDNUR: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
         rd.sales_invoice_id AS original_invoice_number, 
         od.sales_created_date AS original_invoice_date,
         rd.return_invoice_id AS note_number,
         rd.return_created_date AS note_date,
         'Sale Return' AS note_type,
         'B2C' AS type_of_supply,
         org.org_pincode AS pincode,
         rd.return_amount AS note_value,
         rci.gst AS rate,
         rci.hsn,
         rci.return_total
          FROM return_details rd
          JOIN return_cart_item rci ON rd.return_invoice_id = rci.return_invoice_id
          JOIN order_details od ON rd.sales_invoice_id = od.invoice_id_main
          JOIN organisation org ON od.org_id = org.org_id
          WHERE rd.org_id = ? AND rd.return_status = 'active' AND rd.return_created_date BETWEEN ? AND ?
      `,
      [
        orgId, startDate, endDate,
      ],
    );
    return results;
  },

  inwardHSNWisePurchaseDetails: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
            v.vendor_gstin AS receipient_gstin,
            v.vendor_name AS receiver_name,
            org.org_gstin AS supplier_gstin,
            'Purchase' AS type_of_supply,
            gcd.gst AS rate,
            (grn.total - grn.less_discount + grn.total_sgst + grn.total_cgst + grn.total_igst + grn.credit_debit) AS invoice_value,
            grn.total AS total_gross,
            grn.less_discount,
            gcd.hsn,
            (gcd.qty - gcd.free) AS pri_qty,
            0 AS sec_qty,
            gcd.conversion,
            ((gcd.purchase * (gcd.qty - gcd.free)) - gcd.bulk_discount) AS item_value
            FROM grn
            JOIN grn_cart_details gcd ON grn.grn_id = gcd.grn_id
            JOIN organisation org ON grn.org_id = org.org_id
            JOIN vendor v ON grn.vendor_id = v.vendor_id
            WHERE grn.org_id = ?
            AND grn.status = 'active' AND grn.created_date_grn BETWEEN ? AND ?
        `,
      [
        orgId, startDate, endDate,
      ],
    );
    return results;
  },

  inwardHSNWiseSaleReturnDetails: async (connection, orgId, startDate, endDate) => {
    const [results] = await connection.query(
      `SELECT
            'Sale Return' AS type_of_supply,
            rd.return_amount,
            rci.gst AS rate,
            rci.hsn,
            rci.return_total,
            rci.return_pri_qty AS pri_qty, 
            rci.return_sec_qty AS sec_qty,
            rci.conversion
            FROM return_details rd
            JOIN return_cart_item rci ON rd.return_invoice_id = rci.return_invoice_id
            JOIN order_details od ON rd.sales_invoice_id = od.invoice_id_main
            JOIN organisation org ON od.org_id = org.org_id
            WHERE rd.org_id = ? AND rd.return_status = 'active' AND rd.return_created_date BETWEEN ? AND ?
        `,
      [
        orgId, startDate, endDate,
      ],
    );
    return results;
  },
};
