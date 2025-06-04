require('dotenv').config();
const { createPool } = require('mysql2');

let pool;

function getPool() {
  if (!pool) {
    pool = createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.MYSQL_DB,
      connectionLimit: 10,
    });
  }
  return pool;
}

const updateCreditNoteGST = async () => {
  const pl = getPool();
  const connection = await pl.promise().getConnection();

  try {
    await connection.beginTransaction();
    const [creditNoteEntries] = await connection.query('SELECT * FROM credit_note WHERE total_cgst IS NULL OR total_sgst IS NULL OR total_igst IS NULL;');

    await Promise.all(
      creditNoteEntries.map(async (entry) => {
        // Get GST type
        let gstType;

        const [organisation] = await connection.query('SELECT org_gstin FROM organisation WHERE org_id = ?', [entry.org_id]);
        const orgGstin = organisation[0].org_gstin;
        const orgStateCode = orgGstin.substring(0, 2);

        const [vendor] = await connection.query('SELECT vendor_gstin FROM vendor WHERE vendor_id = ?', [entry.vendor_id]);
        const vendorGstin = vendor[0].vendor_gstin;
        const vendorStateCode = vendorGstin.substring(0, 2);

        if (orgStateCode === vendorStateCode) {
          gstType = 'intra';
        } else {
          gstType = 'inter';
        }

        // Calculate GST
        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        const lessDiscountPercent = (entry.less_discount / entry.credit_amt) * 100;

        // Get purchase items
        const [creditNoteItems] = await connection.query(
          `SELECT bth.purchase_rate, bth.conversion, inv.hsn, inv.gst, cncd.*  FROM credit_note_cart_details cncd
            JOIN batch bth ON cncd.batch_id_credit = bth.batch_id
            JOIN inventory inv ON bth.inventory_id = inv.inventory_id
            WHERE credit_invoice_id =  ?`,
          [entry.credit_invoice_id],
        );

        // Iterate over purchase items
        creditNoteItems.forEach((item) => {
          // eslint-disable-next-line max-len
          const itemTotal = ((item.pri_unit_credit * item.purchase_rate) + ((item.purchase_rate / item.conversion) * item.sec_unit_credit)) * (1 - (lessDiscountPercent / 100));

          let itemCgst = 0;
          let itemSgst = 0;
          let itemIgst = 0;

          if (gstType === 'intra') {
            itemCgst = itemTotal * (item.gst / 2 / 100);
            itemSgst = itemTotal * (item.gst / 2 / 100);
            totalCgst += itemCgst;
            totalSgst += itemSgst;
          } else if (gstType === 'inter') {
            itemIgst = itemTotal * (item.gst / 100);
            totalIgst += itemIgst;
          }
        });

        const totalCgstRounded = totalCgst.toFixed(2);
        const totalSgstRounded = totalSgst.toFixed(2);
        const totalIgstRounded = totalIgst.toFixed(2);

        await connection.query('UPDATE credit_note SET total_cgst = ?, total_sgst = ?, total_igst = ? WHERE credit_invoice_id = ?', [totalCgstRounded, totalSgstRounded, totalIgstRounded, entry.credit_invoice_id]);

        console.log(`Updated GST for credit note entry ${entry.credit_invoice_id}`);
      }),
    );
    console.log('***All credit note entries updated successfully***');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('***Error updating credit note entry GST***', error);
  } finally {
    connection.release();
  }
};

updateCreditNoteGST();
