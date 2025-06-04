const { getPool } = require('../config/database');
const { es } = require('../config/elasticsearch');

module.exports = {

  // Create product in Elasticsearch index
  createProductES: async (data, productId, callBack) => {
    const body = {
      id: productId,
      med_name: data.med_name,
      mfd_mkt: data.mfd_mkt,
      salt_composition: data.salt,
      selling_unit: data.conversion,
      added_by: data.org_id,
      is_verified: false,
    };

    try {
      const result = await es.index({
        index: 'product_search_index_v2',
        body,
      });
      console.log(result);
      return callBack(null, result);
    } catch (error) {
      return callBack(error);
    }
  },

  // Create product
  createProductMYSQL: (data, callBack) => {
    getPool().query(
      `insert into sample(
                med_name,
                mfd_mkt,
                salt_composition,
                conversion,
                added_by,
                is_verified)
                values(?,?,?,?,?,?)`,
      [
        data.med_name,
        data.mfd_mkt,
        data.salt,
        data.conversion,
        data.org_id,
        false,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Update product
  updateProductMYSQL: (id, data, callBack) => {
    getPool().query(
      `update sample set
            product_name = ?,
            pack_size = ?,
            conversion = ?,
            mfd_mkt = ?,
            salt = ?,
            hsn = ?,
            gst = ?,
            primary_unit = ?,
            secondary_unit = ?,
            addedBy = ?,
            verified = ?
            where product_id = ?`,
      [
        data.product_name,
        data.pack_size,
        data.conversion,
        data.brand,
        data.salt,
        data.type,
        data.gst,
        data.hsn,
        data.primary_unit,
        data.secondary_unit,
        data.verfied,
        id,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      },
    );
  },

  // Delete product
  delete: (data, callBack) => {
    getPool().query(
      'delete from sample where product_id = ?',
      [data],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Get product by product ID
  getById: (data, callBack) => {
    getPool().query(
      'select * from sample where product_id = ? and added_by = ?',
      [
        data.product_id,
        data.org_id,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      },

    );
  },
};
