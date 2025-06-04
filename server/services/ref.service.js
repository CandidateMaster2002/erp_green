const { getPool } = require('../config/database');

module.exports = {

  // Create Reference
  create: (data, callBack) => {
    getPool().query(
      `insert into reference(
                org_id,
                refer_name)
            value(?,?)`,
      [
        data.org_id,
        data.refer_name,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },
};
