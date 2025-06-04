module.exports = {
  getRegisteredOrganisationsAll: async (connection) => {
    const [results] = await connection.query(
      'SELECT * FROM organisation',
    );
    return results;
  },

  getRegisteredOrganisationsToday: async (connection) => {
    const [results] = await connection.query(
      'SELECT * FROM organisation WHERE org_created = CURDATE()',
    );
    return results;
  },

  getSaleCountAll: async (connection) => {
    const [results] = await connection.query(
      `SELECT 
            org.org_name as PharmacyName, COUNT(*) as SaleCount 
        FROM 
            order_details od
        JOIN 
            organisation org ON od.org_id = org.org_id 
        WHERE 
            org.org_id IS NOT NULL 
        GROUP BY 
            od.org_id`,
    );
    return results;
  },

  getSaleCountToday: async (connection) => {
    const [results] = await connection.query(
      `SELECT 
            org.org_name as PharmacyName, COUNT(*) as SaleCount 
        FROM 
            order_details od
        JOIN 
            organisation org ON od.org_id = org.org_id 
        WHERE 
            org.org_created = CURDATE() AND org.org_id IS NOT NULL 
        GROUP BY 
            od.org_id`,
    );
    return results;
  },
};
