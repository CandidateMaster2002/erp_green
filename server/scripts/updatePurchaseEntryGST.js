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

const updatePurchaseEntryGST = async () => {
  const pl = getPool();
  const connection = await pl.promise().getConnection();

  try {
    await connection.beginTransaction();
    const [purchaseEntries] = await connection.query('SELECT * FROM grn WHERE total_cgst IS NULL OR total_sgst IS NULL OR total_igst IS NULL;');

    await Promise.all(
      purchaseEntries.map(async (entry) => {
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
        const lessDiscountPercent = (entry.less_discount / entry.total) * 100;

        // Get purchase items
        const [purchaseItems] = await connection.query('SELECT * FROM grn_cart_details WHERE grn_id = ?', [entry.grn_id]);

        // Iterate over purchase items
        purchaseItems.forEach((item) => {
          // eslint-disable-next-line max-len
          const itemTotal = (item.qty - item.free) * item.purchase * (1 - item.bulk_discount / 100) * (1 - (lessDiscountPercent / 100));

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

        await connection.query('UPDATE grn SET total_cgst = ?, total_sgst = ?, total_igst = ? WHERE grn_id = ?', [totalCgstRounded, totalSgstRounded, totalIgstRounded, entry.grn_id]);

        console.log(`Updated GST for purchase entry ${entry.grn_id}`);
      }),
    );
    console.log('***All purchase entries updated successfully***');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('***Error updating purchase entry GST***', error);
  } finally {
    connection.release();
  }
};

updatePurchaseEntryGST();
