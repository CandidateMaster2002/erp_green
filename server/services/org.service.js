/* eslint-disable camelcase */
const { getPool } = require('../config/database');

module.exports = {

  // Update Organisation
  update: (orgId, data, callBack) => {
    getPool().query(
      `update organisation set 
            org_name = ?,
            owner_name = ?,
            org_gstin = ?,
            org_alt_telephone = ?,
            org_email = ?,
            org_city = ?,
            org_state = ?,
            org_pincode = ?,
            org_address = ?,
            org_dl_no_1 = ?,
            org_dl_no_2 =?,
            org_dl_no_3 = ?,
            org_dl_no_4 =?,
            org_fssai_no = ?,
            org_shop_lic = ?
            where org_id = ?`,
      [
        data.org_name,
        data.owner_name,
        data.org_gstin,
        data.org_alt_telephone,
        data.org_email,
        data.org_city,
        data.org_state,
        data.org_pincode,
        data.org_address,
        data.org_dl_no_1,
        data.org_dl_no_2,
        data.org_dl_no_3,
        data.org_dl_no_4,
        data.org_fssai_no,
        data.org_shop_lic,
        orgId,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Get Organisation by Id
  getOrgId: (id, callBack) => {
    getPool().query(
      'select * from organisation where org_id = ?',
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      },

    );
  },
};
