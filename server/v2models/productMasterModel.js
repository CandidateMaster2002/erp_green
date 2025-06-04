const { es } = require('../config/elasticsearch');

module.exports = {
  createProductMYSQL: async (connection, data, orgId) => {
    const [results] = await connection.query(
      `insert into sample(
                    med_name,
                    mfd_mkt,
                    salt_composition,
                    added_by,
                    is_verified)
                    values(?,?,?,?,?)`,
      [
        data.medName,
        data.mfdMkt,
        data.salt,
        orgId,
        false,
      ],
    );
    return results.insertId;
  },

  createProductES: async (data, productId, orgId) => {
    const body = {
      id: productId,
      med_name: data.medName,
      mfd_mkt: data.mfdMkt,
      salt_composition: data.salt,
      added_by: orgId,
      is_verified: false,
    };
    const result = await es.index({
      index: 'product_search_index_v2',
      body,
    });

    return result;
  },

};
