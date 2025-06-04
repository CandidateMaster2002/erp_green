module.exports = {
  createDistributor: async (connection, data) => {
    const [results] = await connection.query(
      `insert into vendor(
                org_id,
                vendor_name,
                vendor_address,
                vendor_contact,
                vendor_email,
                vendor_gstin,
                vendor_dl_no_1,
                vendor_dl_no_2,
                vendor_fssai
                )
                values(?,?,?,?,?,?,?,?,?)`,
      [
        data.org_id,
        data.vendor_name,
        data.vendor_address,
        data.vendor_contact,
        data.vendor_email,
        data.vendor_gstin,
        data.vendor_dl_no_1,
        data.vendor_dl_no_2,
        data.vendor_fssai,
      ],
    );
    return results.insertId;
  },

  updateDistributor: async (connection, data, distributorId) => {
    const [results] = await connection.query(
      `update vendor set
            vendor_name= ?,
            vendor_address= ?,
            vendor_contact = ?,
            vendor_email = ?,
            vendor_gstin = ?,
            vendor_dl_no_1 = ?,
            vendor_dl_no_2 = ?,
            vendor_fssai = ?
            where vendor_id = ?`,
      [
        data.vendor_name,
        data.vendor_address,
        data.vendor_contact,
        data.vendor_email,
        data.vendor_gstin,
        data.vendor_dl_no_1,
        data.vendor_dl_no_2,
        data.vendor_fssai,
        distributorId,
      ],
    );
    return results.affectedRows;
  },

  deleteDistributor: async (connection, distributorId) => {
    const [results] = await connection.query(
      'delete from vendor where vendor_id = ?',
      [distributorId],
    );
    return results.affectedRows;
  },

  getAllDistributorsById: async (connection, orgId) => {
    const [results] = await connection.query(
      'select * from vendor where org_id = ?',
      [orgId],
    );
    return results;
  },

  getDistributorById: async (connection, distributorId) => {
    const [results] = await connection.query(
      'select * from vendor where vendor_id = ?',
      [distributorId],
    );
    return results;
  },

  checkGstinByOrgId: async (connection, orgId, gstin) => {
    const [results] = await connection.query(
      'select * from vendor where org_id = ? and vendor_gstin = ?',
      [orgId, gstin],
    );
    return results;
  },

  getDistributorGSTIN: async (connection, vendorId) => {
    const [results] = await connection.query(
      'select vendor_gstin from vendor where vendor_id = ?',
      [vendorId],
    );
    return results[0];
  },
};
