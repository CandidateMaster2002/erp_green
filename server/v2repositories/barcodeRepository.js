module.exports = {
  getBatchData: async (connection, batchId, orgId) => {
    const [results] = await connection.query(
      `SELECT 
            bth.batch_id, bth.product_id, bth.org_id, bth.batch_name, bth.exp_date, bth.mrp, 
            ((bth.batch_qty - bth.saled_pri_qty) * bth.conversion - bth.saled_sec_qty) DIV bth.conversion AS remPriQty, 
            ((bth.batch_qty - bth.saled_pri_qty) * bth.conversion - bth.saled_sec_qty) MOD bth.conversion AS remSecQty,
            spl.med_name
        FROM 
            batch bth
        JOIN 
            sample spl ON bth.product_id = spl.product_id
        WHERE 
            bth.batch_id = ? AND bth.org_id = ?`,
      [
        batchId,
        orgId,
      ],
    );
    return results[0];
  },
};
