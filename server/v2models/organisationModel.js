module.exports = {
  getPharmacyId: async (connection, orgId) => {
    const [results] = await connection.query(
      'SELECT org_id_main FROM organisation WHERE org_id = ?',
      [orgId],
    );
    return results;
  },

  getOrgById: async (connection, orgId) => {
    const [results] = await connection.query(
      'SELECT * FROM organisation WHERE org_id = ?',
      [orgId],
    );
    return results;
  },

  getOrgGSTIN: async (connection, orgId) => {
    const [results] = await connection.query(
      'SELECT org_gstin FROM organisation WHERE org_id = ?',
      [orgId],
    );
    return results[0];
  },

  updateAccess: async (connection, orgId, access) => {
    const [results] = await connection.query(
      'UPDATE organisation SET org_access = ? WHERE org_id = ?',
      [access, orgId],
    );
    return results.affectedRows;
  },
};
